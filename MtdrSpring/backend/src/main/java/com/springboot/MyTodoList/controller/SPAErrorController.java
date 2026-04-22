package com.springboot.MyTodoList.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SPAErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            
            // For 404 errors (not found API or missing route), forward to React's index.html
            // IMPORTANT: only do this if it implies a browser navigation (no /api in URL, or text/html accepted)
            if(statusCode == 404 && !request.getRequestURI().startsWith("/api/")) {
                return "forward:/index.html";
            }
        }
        
        return "forward:/index.html";
    }
}
