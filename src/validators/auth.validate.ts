import Joi from "joi";

export function validateReqisterData(obj: object) {
  const Schema = Joi.object({
    name: Joi.string().trim().min(3).max(20).required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
  });
  return Schema.validate(obj);
}

export function validateLoginData(obj: object) {
  const Schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
  });
  return Schema.validate(obj);
}
