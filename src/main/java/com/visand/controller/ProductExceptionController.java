package com.visand.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class ProductExceptionController {

   @ResponseStatus(HttpStatus.CONFLICT)  // 409
   @ExceptionHandler(NullPointerException.class)
   public void handleConflict() {
      System.out.println("1");
      // Nothing to do
   }
}