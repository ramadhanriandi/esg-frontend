export type User = {
  email: string;
  id: string;
  name: string;
};

export interface Framework {
  framework_code: string;
  name: string;
  version: string;
  jurisdiction: string;
  notes: string | null;
}

export interface FrameworksResponse {
  frameworks: Framework[];
}

export interface SiteResponse {
  sites: Site[];
}

export interface SiteFramework {
  framework_code: string;
  framework_name: string;
  is_active: boolean;
  precedence: number;
}

export interface SiteFrameworksResponse {
  site_id: string;
}

export interface Alert {
  threshold_value: number;
  alert_id: string;
  site_id: string;
  indicator: string;
  severity: string;
  comparator: string;
  observed_value: number;
  status: string;
  raised_at: string;
  cleared_at: string | null;
}

export interface AlertsResponse {
  alerts: Alert[];
}

export interface ThresholdRule {
  indicator: string;
  comparator: string;
  value: number;
  severity: string;
  load_band: number | null;
}

export interface ThresholdsResponse {
  site_id: string;
  framework_code: string;
  rules: ThresholdRule[];
}

export interface Site {
  site_id: string;
  name: string;
  country: string;
  timezone: string;
}
