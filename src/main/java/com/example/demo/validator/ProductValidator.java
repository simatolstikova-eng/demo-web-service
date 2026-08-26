package com.example.demo.validator;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.Product;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class ProductValidator {

    private final ProductService productService;

    public void validateForCreate(ProductDto productDto) {
        if (productDto == null) {
            throw new IllegalArgumentException("Данные товара не могут быть пустыми");
        }

        if (!StringUtils.hasText(productDto.getName())) {
            throw new IllegalArgumentException("Название товара обязательно");
        }

        if (productDto.getPrice() == null || productDto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Цена товара должна быть больше или равна 0");
        }

        if (productDto.getQuantity() == null || productDto.getQuantity() < 0) {
            throw new IllegalArgumentException("Количество товара должно быть больше или равно 0");
        }

        if (productService.existsByName(productDto.getName())) {
            throw new DuplicateResourceException("Товар уже существует: " + productDto.getName());
        }
    }

    public void validateForUpdate(ProductDto productDto, Product existingProduct) {
        if (productDto == null) {
            throw new IllegalArgumentException("Данные товара не могут быть пустыми");
        }

        if (productDto.getPrice() != null && productDto.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Цена товара должна быть больше или равна 0");
        }

        if (productDto.getQuantity() != null && productDto.getQuantity() < 0) {
            throw new IllegalArgumentException("Количество товара должно быть больше или равно 0");
        }

        if (productDto.getName() != null &&
            !productDto.getName().equals(existingProduct.getName()) &&
            productService.existsByName(productDto.getName())) {
            throw new DuplicateResourceException("Товар уже существует: " + productDto.getName());
        }
    }
}