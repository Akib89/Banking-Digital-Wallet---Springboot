package com.example.wallet.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtils {
    private MoneyUtils() {}

    public static BigDecimal positive(BigDecimal amount) {
        if (amount == null) {
            throw new BadRequestException("Amount is required");
        }
        if (amount.signum() <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }
        try {
            return amount.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException ex) {
            throw new BadRequestException("Amount can have at most 2 decimal places");
        }
    }
}
