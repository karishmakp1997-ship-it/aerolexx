import {
  Globe, ShieldCheck, Shield, Send, Workflow, Clock, Scale, FileCheck, FileText, FileSignature, RadioTower, Radio,
  Route, Gauge, Radar, Stamp, CalendarClock, Fuel, Users, PlaneLanding, PlaneTakeoff, Plane, BedDouble, Sparkles, Eye,
  Headset, ClipboardCheck, Settings, Share2, Award, BadgeCheck, Briefcase, Building2, Compass, Map, MapPin, Navigation,
  Satellite, Target, TrendingUp, Truck, Wrench, Zap, Star, Heart, CheckCircle2, Handshake, Luggage, Hotel, Car,
  CloudSun, Timer, Landmark, Waypoints, Mail, Phone, Circle,
} from 'lucide-react';

// Icons the admin can choose from. The key is what gets stored in the database.
const ICONS = {
  Globe, ShieldCheck, Shield, Send, Workflow, Clock, Scale, FileCheck, FileText, FileSignature, RadioTower, Radio,
  Route, Gauge, Radar, Stamp, CalendarClock, Fuel, Users, PlaneLanding, PlaneTakeoff, Plane, BedDouble, Sparkles, Eye,
  Headset, ClipboardCheck, Settings, Share2, Award, BadgeCheck, Briefcase, Building2, Compass, Map, MapPin, Navigation,
  Satellite, Target, TrendingUp, Truck, Wrench, Zap, Star, Heart, CheckCircle2, Handshake, Luggage, Hotel, Car,
  CloudSun, Timer, Landmark, Waypoints, Mail, Phone,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }) {
  const Cmp = ICONS[name] || Circle;
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
