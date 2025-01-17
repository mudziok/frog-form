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

test("Array payload", () => {
  const formData = new FormData();
  formData.append("interests", "Sports");
  formData.append("interests", "Programming");

  expect(formDataToPayload(formData)).toEqual({
    interests: ["Sports", "Programming"],
  });
});

test("Array in nesting payload", () => {
  const formData = new FormData();
  formData.append("name", "John Doe");
  formData.append("details.interests", "Sports");
  formData.append("details.interests", "Programming");

  expect(formDataToPayload(formData)).toEqual({
    name: "John Doe",
    details: {
      interests: ["Sports", "Programming"],
    },
  });
});
