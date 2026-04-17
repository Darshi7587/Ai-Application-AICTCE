package com.example.edumap.Entity.CO;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Keywords{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    String keyword;

    @OneToMany(cascade = CascadeType.ALL)
    List<Keyword_Pos> reasons=new ArrayList<>();

    @ManyToOne
    CourseOutcomes  courseOutcomes;
}