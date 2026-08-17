package com.syed.intellidocs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class IntellidocsApplication {

	public static void main(String[] args) {
		SpringApplication.run(IntellidocsApplication.class, args);
	}

}
