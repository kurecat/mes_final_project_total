package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.constant.MemberStatus; // status 추가를 위해 import 확인
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberResDto {
    private Long id;        //
    private String email;
    private String name;
    private Authority authority;
    private String status;  //

    public static MemberResDto of(Member member) {
        return MemberResDto.builder()
                .id(member.getId())      // ★
                .email(member.getEmail())
                .name(member.getName())
                .authority(member.getAuthority())
                .status(member.getStatus().name()) // PENDING, ACTIVE 등
                .build();
    }
}
