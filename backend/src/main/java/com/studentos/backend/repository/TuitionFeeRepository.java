package com.studentos.backend.repository;

import com.studentos.backend.model.TuitionFee;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuitionFeeRepository extends JpaRepository<TuitionFee, Long> {

    List<TuitionFee> findByUser(User user);

    List<TuitionFee> findByUserId(Long userId);

    Optional<TuitionFee> findByUserAndTerm(User user, String term);

    @Query("SELECT tf FROM TuitionFee tf WHERE tf.user = :user ORDER BY tf.createdAt DESC")
    List<TuitionFee> findByUserOrderByCreatedAtDesc(@Param("user") User user);

    @Query("SELECT tf FROM TuitionFee tf WHERE tf.user.id = :userId AND tf.term = :term")
    Optional<TuitionFee> findByUserIdAndTerm(@Param("userId") Long userId, @Param("term") String term);

    @Query("SELECT tf FROM TuitionFee tf WHERE tf.programType = :programType ORDER BY tf.createdAt DESC")
    List<TuitionFee> findByProgramTypeOrderByCreatedAtDesc(@Param("programType") TuitionFee.ProgramType programType);

    boolean existsByUserAndTerm(User user, String term);
}
