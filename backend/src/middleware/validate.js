/**
 * Creates an Express middleware that validates req.body using a Zod schema.
 * Responds with 400 + { error, details } on failure.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if(!result.success) {
      const details = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.body = result.data;
    next();
  };
}
