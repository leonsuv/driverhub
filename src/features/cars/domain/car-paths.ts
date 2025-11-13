export function createCarDetailHref(car: { make: string; model: string }): string {
  const makeSegment = encodeURIComponent(car.make);
  const modelSegment = encodeURIComponent(car.model);

  return `/cars/${makeSegment}/${modelSegment}`;
}
