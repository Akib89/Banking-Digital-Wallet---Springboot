package com.example.wallet.common;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class MoneyUtilsTest {
    @Test
    void acceptsPositiveTwoDecimalAmount() {
        assertEquals(new BigDecimal("12.50"), MoneyUtils.positive(new BigDecimal("12.50")));
    }

    @Test
    void rejectsZero() {
        assertThrows(BadRequestException.class, () -> MoneyUtils.positive(BigDecimal.ZERO));
    }

    @Test
    void rejectsMoreThanTwoDecimals() {
        assertThrows(BadRequestException.class, () -> MoneyUtils.positive(new BigDecimal("1.001")));
    }
}
