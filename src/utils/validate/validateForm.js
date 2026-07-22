/**
 * Validates a plain object against a Zod schema outside of React Hook
 * Form's render cycle (e.g. validating query params before dispatching a
 * thunk). Returns a normalized { success, data, errors } shape instead of
 * Zod's raw SafeParseResult so callers don't need to know about Zod.
 */
export const validateWithSchema = (schema, payload) => {
  const result = schema.safeParse(payload);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  const errors = result.error.issues.reduce((acc, issue) => {
    const field = issue.path.join('.') || '_root';
    acc[field] = issue.message;
    return acc;
  }, {});

  return { success: false, data: null, errors };
};
