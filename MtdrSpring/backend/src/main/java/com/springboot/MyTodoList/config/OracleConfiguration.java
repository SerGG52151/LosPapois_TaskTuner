package com.springboot.MyTodoList.config;


import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;


import javax.sql.DataSource;
import java.sql.SQLException;
///*
//    This class grabs the appropriate values for OracleDataSource,
//    The method that uses env, grabs it from the environment variables set
//    in the docker container. The method that uses dbSettings is for local testing
//    @author: peter.song@oracle.com
// */
//
//
@Configuration
public class OracleConfiguration {
    Logger logger = LoggerFactory.getLogger(DbSettings.class);
    private final Environment env;

    public OracleConfiguration(Environment env) {
        this.env = env;
    }

    private String resolveProperty(String envKey, String springKey) {
        String envValue = env.getProperty(envKey);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue;
        }
        return env.getProperty(springKey);
    }

    @Bean
    public DataSource dataSource() throws SQLException{
        OracleDataSource ds = new OracleDataSource();
        String driver = resolveProperty("driver_class_name", "spring.datasource.driver-class-name");
        String url = resolveProperty("db_url", "spring.datasource.url");
        String user = resolveProperty("db_user", "spring.datasource.username");
        String password = resolveProperty("dbpassword", "spring.datasource.password");

        ds.setDriverType(driver);
        logger.info("Using Driver {}", driver);
        ds.setURL(url);
        logger.info("Using URL: {}", url);
        ds.setUser(user);
        logger.info("Using Username {}", user);
        ds.setPassword(password);
        return ds;
    }
}
