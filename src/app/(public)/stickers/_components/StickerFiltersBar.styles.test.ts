import { describe, expect, it } from "bun:test";
import {
  getFilterChevronClassName,
  getTagOptionButtonClassName,
} from "./StickerFiltersBar.styles";

// Este test suite valida el contrato de estilos para los filtros de stickers.
describe("StickerFiltersBar.styles", () => {
  it("adds hover for inactive tag buttons", () => {
    const className = getTagOptionButtonClassName({ active: false });
    expect(className).toContain("hover:bg-white/10");
    expect(className).toContain("hover:border-primary/30");
  });

  // Test para verificar el hover para botones de etiqueta activos.
  it("adds hover for active tag buttons", () => {
    const className = getTagOptionButtonClassName({ active: true });
    expect(className).toContain("hover:bg-primary/20");
    expect(className).toContain("hover:border-primary/50");
  });

  // Test para verificar el hover para el chevrolet via group hover.
  it("adds hover on chevron via group hover", () => {
    const className = getFilterChevronClassName();
    expect(className).toContain("group-hover:bg-white/10");
    expect(className).toContain("group-hover:border-primary/30");
  });
});
