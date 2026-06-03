package com.studentos.backend.dto;

import com.studentos.backend.model.Message;
import com.studentos.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryDTO {
    private User otherUser;
    private Message latestMessage;
}
