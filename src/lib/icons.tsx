import React from 'react';
import {
  LucideProps,
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Coins,
  Wallet,
  CreditCard,
  Gift,
  Diamond,
  Trophy,
  Gamepad2,
  Swords,
  Crosshair,
  Dices,
  Crown,
  Flame,
  Zap,
  Rocket,
  Box,
  Sparkles,
  Palette,
  Clapperboard,
  Tv,
  Film,
  Music,
  Headphones,
  Video,
  Camera,
  Layers,
  Send,
  Users,
  User,
  Radio,
  AtSign,
  Share2,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Star,
  Heart,
  Smartphone,
  Monitor,
  Key,
  Lock,
  Bookmark,
  Bell,
  Clock,
  Compass,
  Globe,
  Sparkle,
} from 'lucide-react';

export interface IconItem {
  name: string;
  category: 'commerce' | 'gaming' | 'media' | 'general' | 'social';
}

export const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // Commerce
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Coins,
  Wallet,
  CreditCard,
  Gift,
  Diamond,
  Trophy,

  // Gaming
  Gamepad2,
  Swords,
  Crosshair,
  Dices,
  Crown,
  Flame,
  Zap,
  Rocket,
  Box,

  // Media
  Sparkles,
  Palette,
  Clapperboard,
  Tv,
  Film,
  Music,
  Headphones,
  Video,
  Camera,
  Layers,

  // Social
  Send,
  Users,
  User,
  Radio,
  AtSign,
  Share2,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,

  // General & Security
  ShieldCheck,
  CheckCircle2,
  Star,
  Heart,
  Smartphone,
  Monitor,
  Key,
  Lock,
  Bookmark,
  Bell,
  Clock,
  Compass,
  Globe,
  Sparkle,
};

export const POPULAR_ICONS: IconItem[] = [
  // Products & Commerce
  { name: 'Package', category: 'commerce' },
  { name: 'ShoppingBag', category: 'commerce' },
  { name: 'ShoppingCart', category: 'commerce' },
  { name: 'Tag', category: 'commerce' },
  { name: 'Coins', category: 'commerce' },
  { name: 'Wallet', category: 'commerce' },
  { name: 'CreditCard', category: 'commerce' },
  { name: 'Gift', category: 'commerce' },
  { name: 'Diamond', category: 'commerce' },
  { name: 'Trophy', category: 'commerce' },

  // Gaming & Entertainment
  { name: 'Gamepad2', category: 'gaming' },
  { name: 'Swords', category: 'gaming' },
  { name: 'Crosshair', category: 'gaming' },
  { name: 'Dices', category: 'gaming' },
  { name: 'Crown', category: 'gaming' },
  { name: 'Flame', category: 'gaming' },
  { name: 'Zap', category: 'gaming' },
  { name: 'Rocket', category: 'gaming' },
  { name: 'Box', category: 'gaming' },

  // Media & Streaming & Apps
  { name: 'Sparkles', category: 'media' },
  { name: 'Palette', category: 'media' },
  { name: 'Clapperboard', category: 'media' },
  { name: 'Tv', category: 'media' },
  { name: 'Film', category: 'media' },
  { name: 'Music', category: 'media' },
  { name: 'Headphones', category: 'media' },
  { name: 'Video', category: 'media' },
  { name: 'Camera', category: 'media' },
  { name: 'Layers', category: 'media' },

  // Social & Communication
  { name: 'Send', category: 'social' },
  { name: 'Users', category: 'social' },
  { name: 'User', category: 'social' },
  { name: 'Radio', category: 'social' },
  { name: 'AtSign', category: 'social' },
  { name: 'Share2', category: 'social' },
  { name: 'MessageSquare', category: 'social' },
  { name: 'MessageCircle', category: 'social' },
  { name: 'Phone', category: 'social' },
  { name: 'Mail', category: 'social' },

  // General & Security
  { name: 'ShieldCheck', category: 'general' },
  { name: 'CheckCircle2', category: 'general' },
  { name: 'Star', category: 'general' },
  { name: 'Heart', category: 'general' },
  { name: 'Smartphone', category: 'general' },
  { name: 'Monitor', category: 'general' },
  { name: 'Key', category: 'general' },
  { name: 'Lock', category: 'general' },
  { name: 'Bookmark', category: 'general' },
  { name: 'Bell', category: 'general' },
  { name: 'Clock', category: 'general' },
  { name: 'Compass', category: 'general' },
  { name: 'Globe', category: 'general' },
  { name: 'Sparkle', category: 'general' },
];

export function getLucideIcon(name: string): React.ComponentType<LucideProps> {
  const cleanName = name?.trim();
  if (cleanName && cleanName in ICON_MAP) {
    return ICON_MAP[cleanName];
  }

  // Fallback case-insensitive search
  const foundKey = Object.keys(ICON_MAP).find(
    (k) => k.toLowerCase() === cleanName?.toLowerCase()
  );

  if (foundKey) {
    return ICON_MAP[foundKey];
  }

  return Package;
}

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = getLucideIcon(name);
  return <IconComponent {...props} />;
}
