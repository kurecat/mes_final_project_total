package com.hm.mes_final_260106;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.constant.MemberStatus;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class MesFinal260106Application {

	public static void main(String[] args) {
		SpringApplication.run(MesFinal260106Application.class, args);
	}
    @Bean
    public CommandLineRunner initData(MemberRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (!repo.existsByEmail("admin@mes.com")) {
                repo.save(Member.builder()
                        .email("admin@mes.com")
                        .password(encoder.encode("1234"))
                        .name("관리자형님")
                        .authority(Authority.ROLE_ADMIN)
                        .status(MemberStatus.ACTIVE)
                        .build());
                System.out.println(" 관리자 계정 생성 완료");
            }
            // 2. 승인 대기 유저 (테스트용)
            if (!repo.existsByEmail("user@mes.com")) {
                repo.save(Member.builder()
                        .email("user@mes.com")
                        .password(encoder.encode("1234"))
                        .name("신입사원")
                        .authority(Authority.ROLE_OPERATOR)
                        .status(MemberStatus.PENDING) // ★ 여기서 승인 대기 상태로 설정
                        .build());
                System.out.println("⏳ 승인 대기 유저 생성 완료 (user@mes.com)");
            }
            // 3. 승인 대기 유저 (테스트용)
            if (!repo.existsByEmail("user1@mes.com")) {
                repo.save(Member.builder()
                        .email("user1@mes.com")
                        .password(encoder.encode("1234"))
                        .name("신입사원")
                        .authority(Authority.ROLE_OPERATOR)
                        .status(MemberStatus.PENDING) // ★ 여기서 승인 대기 상태로 설정
                        .build());
                System.out.println("⏳ 승인 대기 유저 생성 완료 (user@mes.com)");
            }
            // 4. 승인 대기 유저 (테스트용)
            if (!repo.existsByEmail("user2@mes.com")) {
                repo.save(Member.builder()
                        .email("user2@mes.com")
                        .password(encoder.encode("1234"))
                        .name("신입사원")
                        .authority(Authority.ROLE_OPERATOR)
                        .status(MemberStatus.PENDING) // ★ 여기서 승인 대기 상태로 설정
                        .build());
                System.out.println("⏳ 승인 대기 유저 생성 완료 (user@mes.com)");
            }

        };


    }

}