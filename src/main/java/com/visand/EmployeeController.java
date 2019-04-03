package com.visand;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class EmployeeController {

	@CrossOrigin
	@GetMapping("/employees/{id}")
	Employee one(@PathVariable Long id) {
		return new Employee("test");
	}

//	@PutMapping("/employees/{id}")
//	Employee replaceEmployee(@RequestBody Employee newEmployee, @PathVariable Long id) {
//
//		return repository.findById(id)
//			.map(employee -> {
//				employee.setName(newEmployee.getName());
//				employee.setRole(newEmployee.getRole());
//				return repository.save(employee);
//			})
//			.orElseGet(() -> {
//				newEmployee.setId(id);
//				return repository.save(newEmployee);
//			});
//	}

}