package com.visand;

public class MyService2 {

    private MyService myService;

    public MyService2(MyService myService) {
        this.myService = myService;
    }

    public String message() {
        return myService.message();
    }
}
