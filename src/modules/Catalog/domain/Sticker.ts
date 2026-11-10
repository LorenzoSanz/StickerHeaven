import { Entity } from "../../../shared/domain/Entity";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { StickerName } from "./StickerName";
import { StickerDescription } from "./StickerDescription";
import { Money } from "../../../shared/domain/Money";
import { StickerUrl } from "./StickerUrl";
import { StickerTag } from "./StickerTag";
import { OwnerId } from "./OwnerId";
import { StickerStock } from "./StickerStock";
import { StickerId } from "@/shared/domain/StickerId";

export interface StickerProps {
  ownerId: OwnerId; // Reference to Identity User ID
  name: StickerName;
  description: StickerDescription;
  price: Money;
  stock: StickerStock;
  imageUrl: StickerUrl;
  tags: StickerTag[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Sticker extends Entity<StickerProps, StickerId> {
  private constructor(props: StickerProps, id: StickerId) {
    super(props, id);
  }

  public static reconstitute(id: StickerId, props: StickerProps): Sticker {
    return new Sticker(props, id);
  }

  public static create(
    ownerId: OwnerId,
    name: StickerName,
    description: StickerDescription,
    price: Money,
    stock: StickerStock,
    imageUrl: StickerUrl,
    rawTags: string[] = []
  ): Result<Sticker, DomainError> {
    const tags: StickerTag[] = [];
    for (const rawTag of rawTags) {
      const tagOrError = StickerTag.create(rawTag);
      if (tagOrError.isFailure) {
        return Result.fail(tagOrError.error!);
      }
      tags.push(tagOrError.getValue());
    }

    const sticker = new Sticker({
      ownerId,
      name,
      description,
      price,
      stock,
      imageUrl,
      tags: tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }, StickerId.random());

    return Result.ok<Sticker, DomainError>(sticker);
  }

  public update(
    name?: StickerName,
    description?: StickerDescription,
    price?: Money,
    stock?: StickerStock,
    imageUrl?: StickerUrl,
    rawTags?: string[]
  ): Result<void, DomainError> {
    if (name) this.props.name = name;
    if (description) this.props.description = description;
    if (price) this.props.price = price;
    if (stock) this.props.stock = stock;
    if (imageUrl) this.props.imageUrl = imageUrl;
    
    if (rawTags) {
      const tags: StickerTag[] = [];
      for (const rawTag of rawTags) {
        const tagOrError = StickerTag.create(rawTag);
        if (tagOrError.isFailure) {
          return Result.fail(tagOrError.error!);
        }
        tags.push(tagOrError.getValue());
      }
      this.props.tags = tags;
    }
    
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public isOwnedBy(userId: OwnerId): boolean {
    return this.props.ownerId.equals(userId);
  }

  get ownerId(): OwnerId {
    return this.props.ownerId;
  }

  get name(): StickerName {
    return this.props.name;
  }

  get description(): StickerDescription {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get stock(): StickerStock {
    return this.props.stock;
  }

  get imageUrl(): StickerUrl {
    return this.props.imageUrl;
  }

  get tags(): StickerTag[] {
    return [...this.props.tags];
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }
  
  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  get version(): number {
    return this.props.version;
  }
}
