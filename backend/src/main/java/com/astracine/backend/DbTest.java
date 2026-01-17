package com.astracine.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@SpringBootApplication
public class DbTest {

    public static void main(String[] args) {
        try (ConfigurableApplicationContext ctx = SpringApplication.run(DbTest.class, args)) {
            DataSource ds = ctx.getBean(DataSource.class);

            try (Connection conn = ds.getConnection()) {
                System.out.println("✅ Connected: " + conn.getMetaData().getURL());

                String sql = "SELECT id, title, duration_minutes, status FROM movies ORDER BY id";
                try (PreparedStatement ps = conn.prepareStatement(sql);
                     ResultSet rs = ps.executeQuery()) {

                    System.out.println("---- MOVIES ----");
                    int count = 0;
                    while (rs.next()) {
                        long id = rs.getLong("id");
                        String title = rs.getString("title");
                        int duration = rs.getInt("duration_minutes");
                        String status = rs.getString("status");
                        System.out.printf("id=%d | %s | %d mins | %s%n", id, title, duration, status);
                        count++;
                    }
                    System.out.println("Rows: " + count);
                }
            }
        } catch (Exception e) {
            System.out.println("❌ Error:");
            e.printStackTrace();
        }
    }
}
