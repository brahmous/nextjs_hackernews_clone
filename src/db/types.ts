export function IsValidationError<T>(
  value: any
): value is T {
  return (
    typeof value == 'object' && value != undefined && 'validation_errors_count' in value
  );
}
