const tileColors: Record<number, string> = {
  2: "#936a0b",
  4: "#706339",
  8: "#5a6e4c",
  16: "#BC9476",
  32: "#834c3d",
  64: "#f19340",
  128: "#d89152",
  256: "#e0b266",
  512: "#dcb85c",
  1024: "#d9ae4f",
  2048: "#d6a944",
  4096: "#a49c85",
  8192: "#a49c85",
};

export const getTileStyle = (val: number) => {
  return {
    backgroundColor: `${tileColors[val] || "#fccd80"}`,
    color: "#ffffff",
  };
};
