import { expect, test } from "vitest";
import { formDataToPayload } from "./actionHandler";

test("Simple payload", () => {
  const formData = new FormData();
  formData.append("name", "John Doe");
  formData.append("age", "30");

  expect(formDataToPayload(formData)).toEqual({
    name: "John Doe",
    age: "30",
  });
});

test("Nested payload", () => {
  const formData = new FormData();
  formData.append("name", "John Doe");
  formData.append("details.age", "30");
  formData.append("details.gender", "Male");

  expect(formDataToPayload(formData)).toEqual({
    name: "John Doe",
    details: {
      age: "30",
      gender: "Male",
    },
  });
});
