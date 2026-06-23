import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faWaveSquare,
  faCircleExclamation,
  faArrowDown,
  faSort,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faUpRightFromSquare,
  faBookOpen,
  faBox,
  faBoxOpen,
  faBuilding,
  faCalendarDays,
  faCircleCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleUser,
  faCompass,
  faPenToSquare,
  faFileCircleCheck,
  faFileLines,
  faFilter,
  faCodeCompare,
  faGlobe,
  faEarthAmericas,
  faGraduationCap,
  faHeartPulse,
  faImage,
  faCircleInfo,
  faLayerGroup,
  faTableColumns,
  faTableCells,
  faLightbulb,
  faSpinner,
  faArrowRightFromBracket,
  faEnvelope,
  faBars,
  faMessage,
  faEllipsisVertical,
  faPlus,
  faArrowsRotate,
  faMagnifyingGlass,
  faGear,
  faShield,
  faShieldHalved,
  faBackwardStep,
  faForwardStep,
  faStar,
  faStore,
  faTag,
  faTrash,
  faArrowTrendUp,
  faUpload,
  faUser,
  faUserPen,
  faUserPlus,
  faUsers,
  faXmark,
  faCircleXmark,
  faBolt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faLinkedinIn,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// Sizing CSS is imported statically in app/layout.tsx instead, so it's
// present on first paint rather than injected by JS after hydration
// (which caused icons to flash at their unstyled intrinsic size).
config.autoAddCss = false;

type IconProps = {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
  [key: string]: any;
};

function makeIcon(icon: IconDefinition, spin = false) {
  return function Icon({ size = 18, className, color, style, ...rest }: IconProps) {
    return (
      <FontAwesomeIcon
        icon={icon}
        className={className}
        spin={spin}
        style={{ fontSize: typeof size === "number" ? `${size}px` : size, color, ...style }}
        {...rest}
      />
    );
  };
}

export const Activity = makeIcon(faWaveSquare);
export const Bell = makeIcon(faBell);
export const AlertCircle = makeIcon(faCircleExclamation);
export const ArrowDown = makeIcon(faArrowDown);
export const ArrowDownUp = makeIcon(faSort);
export const ArrowLeft = makeIcon(faArrowLeft);
export const ArrowRight = makeIcon(faArrowRight);
export const ArrowUp = makeIcon(faArrowUp);
export const ArrowUpRight = makeIcon(faUpRightFromSquare);
export const BookOpen = makeIcon(faBookOpen);
export const Box = makeIcon(faBox);
export const Package = makeIcon(faBoxOpen);
export const Building2 = makeIcon(faBuilding);
export const Calendar = makeIcon(faCalendarDays);
export const CheckCircle = makeIcon(faCircleCheck);
export const ChevronDown = makeIcon(faChevronDown);
export const ChevronLeft = makeIcon(faChevronLeft);
export const ChevronRight = makeIcon(faChevronRight);
export const CircleCheck = makeIcon(faCircleCheck);
export const CircleUser = makeIcon(faCircleUser);
export const Compass = makeIcon(faCompass);
export const Edit2 = makeIcon(faPenToSquare);
export const FileCheck = makeIcon(faFileCircleCheck);
export const FileText = makeIcon(faFileLines);
export const Filter = makeIcon(faFilter);
export const GitCompare = makeIcon(faCodeCompare);
export const Globe = makeIcon(faGlobe);
export const Globe2 = makeIcon(faEarthAmericas);
export const GraduationCap = makeIcon(faGraduationCap);
export const HeartPulse = makeIcon(faHeartPulse);
export const Image = makeIcon(faImage);
export const ImageIcon = makeIcon(faImage);
export const Info = makeIcon(faCircleInfo);
export const Layers = makeIcon(faLayerGroup);
export const LayoutDashboard = makeIcon(faTableColumns);
export const LayoutGrid = makeIcon(faTableCells);
export const Lightbulb = makeIcon(faLightbulb);
export const Loader2 = makeIcon(faSpinner, true);
export const LogOut = makeIcon(faArrowRightFromBracket);
export const Mail = makeIcon(faEnvelope);
export const Menu = makeIcon(faBars);
export const MessageSquare = makeIcon(faMessage);
export const MoreVertical = makeIcon(faEllipsisVertical);
export const Plus = makeIcon(faPlus);
export const RefreshCcw = makeIcon(faArrowsRotate);
export const Search = makeIcon(faMagnifyingGlass);
export const Settings = makeIcon(faGear);
export const Shield = makeIcon(faShield);
export const ShieldCheck = makeIcon(faShieldHalved);
export const SkipBack = makeIcon(faBackwardStep);
export const SkipForward = makeIcon(faForwardStep);
export const Star = makeIcon(faStar);
export const Store = makeIcon(faStore);
export const Tag = makeIcon(faTag);
export const Trash2 = makeIcon(faTrash);
export const TrendingUp = makeIcon(faArrowTrendUp);
export const Upload = makeIcon(faUpload);
export const User = makeIcon(faUser);
export const UserPen = makeIcon(faUserPen);
export const UserPlus = makeIcon(faUserPlus);
export const Users = makeIcon(faUsers);
export const X = makeIcon(faXmark);
export const XCircle = makeIcon(faCircleXmark);
export const Zap = makeIcon(faBolt);
export const Phone = makeIcon(faPhone);
export const Facebook = makeIcon(faFacebookF);
export const LinkedinIcon = makeIcon(faLinkedinIn);
export const XTwitter = makeIcon(faXTwitter);
export const Youtube = makeIcon(faYoutube);
