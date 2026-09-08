/**
 * Ambient types for @phosphor-icons/react v2. The package lists its "import"
 * export condition before "types", so TS resolves the .js and misses the
 * bundled declarations. This shim restores typing for the icons we use.
 */
declare module "@phosphor-icons/react" {
  import type { FC, SVGProps } from "react";

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
    color?: string;
    mirrored?: boolean;
  }
  export type Icon = FC<IconProps>;

  export const House: Icon;
  export const SquaresFour: Icon;
  export const ChatCircleDots: Icon;
  export const ArrowsClockwise: Icon;
  export const List: Icon;
  export const Bell: Icon;
  export const QrCode: Icon;
  export const ArrowsLeftRight: Icon;
  export const Lightning: Icon;
  export const Receipt: Icon;
  export const DeviceMobile: Icon;
  export const WifiHigh: Icon;
  export const PaperPlaneTilt: Icon;
  export const Sparkle: Icon;
  export const TrendUp: Icon;
  export const ArrowRight: Icon;
  export const Plus: Icon;
  export const BookOpen: Icon;
  export const Headset: Icon;
  export const Star: Icon;
  export const ChatText: Icon;
  export const Wallet: Icon;
  export const CreditCard: Icon;
  export const PiggyBank: Icon;
  export const CaretDown: Icon;
  export const X: Icon;
  export const CheckCircle: Icon;
  export const Clock: Icon;
  export const LockKey: Icon;
  export const Copy: Icon;
  export const Shield: Icon;
  export const ShieldCheck: Icon;
  export const Gauge: Icon;
  export const User: Icon;
  export const Eye: Icon;
  export const EyeSlash: Icon;
  export const CaretRight: Icon;
  export const Warning: Icon;
  export const ArrowUp: Icon;
  export const ArrowDown: Icon;
}
