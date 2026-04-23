package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Groq LLM client. Only active when groq.enabled=true.
 *
 * Security layers:
 *  1. sanitize() strips prompt injection patterns before any text reaches the model.
 *  2. ask() separates system instructions (server-built) from user content.
 *     The user message is always the last element and cannot overwrite the system role.
 */
@Service
@ConditionalOnProperty(name = "groq.enabled", havingValue = "true")
public class GroqService {

    private static final Logger logger = LoggerFactory.getLogger(GroqService.class);
    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final int MAX_USER_INPUT_LENGTH = 400;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Each pattern targets a well-known prompt injection technique.
    // Using regex so multi-word/spaced variants are caught.
    private static final Pattern[] INJECTION_PATTERNS = {
        // "ignore all/previous instructions"
        Pattern.compile(
            "(?i)ignore\\s+(all\\s+|previous\\s+|prior\\s+|above\\s+|your\\s+)?"
            + "(instructions?|rules?|prompts?|constraints?|guidelines?)"),
        // "you are now X", "act as X", "pretend to be X", "from now on you"
        Pattern.compile(
            "(?i)(you\\s+are\\s+now|act\\s+as|pretend\\s+to\\s+be|"
            + "roleplay\\s+as|simulate\\s+being|from\\s+now\\s+on\\s+you)"),
        // Inline role injection: "system:", "<system>", "###SYSTEM"
        Pattern.compile(
            "(?i)(system\\s*:|<\\s*system\\s*>|\\[\\s*system\\s*\\]|#{2,}\\s*system)"),
        // "forget your/all/previous"
        Pattern.compile("(?i)forget\\s+(your|all|previous)"),
        // Jailbreak keywords
        Pattern.compile(
            "(?i)(jailbreak|dan\\s+mode|developer\\s+mode|god\\s+mode|"
            + "unrestricted\\s+mode|DAN\\b)"),
        // "override/bypass/disable your restrictions/safety"
        Pattern.compile(
            "(?i)(override|bypass|disable|circumvent)\\s+(your\\s+)?"
            + "(restrictions?|rules?|filters?|safety|guidelines?)"),
        // "reveal/show/tell me your system prompt/instructions"
        Pattern.compile(
            "(?i)(reveal|show|tell\\s+me|print|output|repeat|return|display)\\s+"
            + "(your\\s+)?(system\\s+prompt|instructions?|prompt|rules?|constraints?)"),
    };

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.key}")
    private String apiKey;

    // Single shared client — service is a singleton, client is thread-safe
    private final CloseableHttpClient httpClient = HttpClients.createDefault();

    /**
     * Sanitize user input to neutralize prompt injection attempts.
     * Returns null if the input is blank after sanitization.
     */
    public String sanitize(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String s = raw.trim();
        // Hard length cap — limits damage of very long injections
        if (s.length() > MAX_USER_INPUT_LENGTH) {
            s = s.substring(0, MAX_USER_INPUT_LENGTH);
        }

        // Strip newlines — prevents role-switching via "\\nSYSTEM: ..."
        s = s.replace("\n", " ").replace("\r", " ");

        // Replace injection patterns
        for (Pattern p : INJECTION_PATTERNS) {
            s = p.matcher(s).replaceAll("[removed]");
        }

        return s.isBlank() ? null : s;
    }

    /**
     * Send a chat completion request to Groq.
     *
     * @param systemPrompt  Server-built context + rules. Never contains user text.
     * @param userQuestion  Already sanitized user input.
     * @return Model response text.
     */
    public String ask(String systemPrompt, String userQuestion) throws IOException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", MODEL);
        body.put("max_tokens", 400);
        body.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user",   "content", userQuestion));
        body.put("messages", messages);

        HttpPost post = new HttpPost(apiUrl);
        post.addHeader("Content-Type",  "application/json");
        post.addHeader("Authorization", "Bearer " + apiKey);
        post.setEntity(new StringEntity(
            MAPPER.writeValueAsString(body), StandardCharsets.UTF_8));

        // Use response-handler form — avoids deprecated execute(ClassicHttpRequest) overload
        // and properly closes the response inside the client
        String raw = httpClient.execute(post, response -> {
            try {
                return EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            } catch (org.apache.hc.core5.http.ParseException e) {
                throw new IOException("Failed to parse Groq response body", e);
            }
        });

        logger.debug("Groq raw response: {}", raw);

        JsonNode root    = MAPPER.readTree(raw);
        JsonNode content = root.path("choices").path(0).path("message").path("content");
        if (!content.isMissingNode()) {
            return content.asText();
        }
        // Surface API-level error message when present
        JsonNode errMsg = root.path("error").path("message");
        return errMsg.isMissingNode()
            ? "No response received from the AI."
            : "AI error: " + errMsg.asText();
    }
}
