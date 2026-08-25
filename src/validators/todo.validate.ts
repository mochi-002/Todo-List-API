import Joi from "joi";

export function validateCreateToDo(obj: object) {
  const Schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(6).required(),
  });
  return Schema.validate(obj);
}

export function validateUpdateToDo(obj: object) {
  const Schema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(6),
  }).min(1);
  return Schema.validate(obj);
}
