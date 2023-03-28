declare module "geoblaze" {
  /**
   * https://docs.geoblaze.io/#identify
   */
  function identify(
    georaster: GeoRaster | ArrayBuffer | Blob | File | string,
    geometry: string | Point
  ): Promise<number[]> | null;
}
