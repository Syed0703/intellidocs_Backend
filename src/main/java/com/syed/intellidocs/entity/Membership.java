package com.syed.intellidocs.entity;

import com.syed.intellidocs.enums.MembershipRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"user_id", "organization_id"}
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long membershipId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipRole role;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @CreatedDate
    private LocalDateTime joinedAt;

    public Membership(MembershipRole role, User user, Organization organization) {
        this.role = role;
        this.user = user;
        this.organization = organization;
    }
}
