import {
  Activity,
  Clock,
  Cloud,
  Container,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  Layers2,
  Mail,
  Monitor,
  Network,
  Plug,
  Route,
  ScrollText,
  Search,
  Server,
  Shield,
  Smartphone,
  SquareFunction,
  User,
  Warehouse,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  siAlibabacloud,
  siCloudflare,
  siCloudflareworkers,
  siDigitalocean,
  siDocker,
  siElasticsearch,
  siFirebase,
  siGithub,
  siGooglebigquery,
  siGooglecloud,
  siGooglecloudspanner,
  siGooglecloudstorage,
  siGrafana,
  siHelm,
  siHetzner,
  siKubernetes,
  siMongodb,
  siMysql,
  siNetlify,
  siNginx,
  siPostgresql,
  siPrometheus,
  siRabbitmq,
  siRedis,
  siSupabase,
  siTerraform,
  siVercel,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export type IconEntry = {
  id: string;
  label: string;
  keywords: string;
  lucide?: LucideIcon;
  simple?: SimpleIcon;
};
export type IconPack = {
  id: string;
  name: string;
  source: string;
  licence: string;
  icons: IconEntry[];
};

const lucide = (
  id: string,
  label: string,
  icon: LucideIcon,
  keywords = "",
): IconEntry => ({ id: `generic/${id}`, label, lucide: icon, keywords });

const simple = (icon: SimpleIcon, keywords = ""): IconEntry => ({
  id: `cloud/${icon.slug}`,
  label: icon.title,
  simple: icon,
  keywords,
});

export const iconPacks: IconPack[] = [
  {
    id: "generic",
    name: "Generic architecture",
    source: "Lucide",
    licence: "ISC",
    icons: [
      lucide("browser", "Web client", Monitor, "browser frontend ui"),
      lucide("mobile", "Mobile app", Smartphone, "phone client"),
      lucide("user", "User", User, "person actor"),
      lucide("gateway", "API gateway", Route, "routing ingress"),
      lucide("load-balancer", "Load balancer", Network, "traffic"),
      lucide("cdn", "CDN", Globe, "edge internet web"),
      lucide("server", "Server", Server, "service compute vm host"),
      lucide("container", "Container", Container, "pod compute"),
      lucide("function", "Function", SquareFunction, "serverless lambda"),
      lucide("database", "Database", Database, "sql data store"),
      lucide("cache", "Cache", Zap, "memory fast"),
      lucide("queue", "Queue", Layers2, "events messaging broker stream"),
      lucide("storage", "Object storage", HardDrive, "blob files data bucket"),
      lucide("warehouse", "Data warehouse", Warehouse, "analytics lake"),
      lucide("search", "Search", Search, "index"),
      lucide("identity", "Identity", KeyRound, "auth login sso"),
      lucide("firewall", "Firewall", Shield, "security waf"),
      lucide("monitoring", "Monitoring", Activity, "metrics observability"),
      lucide("logs", "Logs", ScrollText, "logging audit"),
      lucide("scheduler", "Scheduler", Clock, "cron job timer"),
      lucide("email", "Email", Mail, "notification smtp"),
      lucide("external-api", "External API", Plug, "third party integration"),
      lucide("cloud", "Cloud", Cloud, "hosting provider"),
    ],
  },
  {
    id: "cloud",
    name: "Cloud & platforms",
    source: "Simple Icons",
    licence: "CC0-1.0",
    icons: [
      simple(siGooglecloud, "gcp provider"),
      simple(siGooglecloudstorage, "gcp gcs bucket object storage data"),
      simple(siGooglecloudspanner, "gcp database sql data"),
      simple(siGooglebigquery, "gcp data warehouse analytics"),
      simple(siFirebase, "google backend database"),
      simple(siCloudflare, "cdn edge dns provider"),
      simple(siCloudflareworkers, "serverless edge function"),
      simple(siAlibabacloud, "provider"),
      simple(siDigitalocean, "provider vm"),
      simple(siHetzner, "provider vm"),
      simple(siVercel, "hosting frontend"),
      simple(siNetlify, "hosting frontend"),
      simple(siSupabase, "backend postgres database"),
      simple(siKubernetes, "k8s orchestration container"),
      simple(siDocker, "container"),
      simple(siHelm, "kubernetes chart"),
      simple(siTerraform, "infrastructure as code iac"),
      simple(siNginx, "web server proxy load balancer"),
      simple(siPostgresql, "postgres sql database data"),
      simple(siMysql, "sql database data"),
      simple(siMongodb, "nosql document database data"),
      simple(siRedis, "cache key value"),
      simple(siRabbitmq, "queue messaging broker"),
      simple(siElasticsearch, "search index"),
      simple(siGrafana, "dashboard monitoring"),
      simple(siPrometheus, "metrics monitoring"),
      simple(siGithub, "git source repository ci"),
    ],
  },
];

const byId = new Map(
  iconPacks.flatMap((pack) => pack.icons.map((icon) => [icon.id, icon])),
);

// Diagrams saved before icon packs used bare symbol names.
export function findIcon(id?: string) {
  if (!id) return undefined;
  return byId.get(id) ?? byId.get(`generic/${id}`);
}

export function matchesIcon(icon: IconEntry, query: string) {
  const text = `${icon.label} ${icon.keywords}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => text.includes(term));
}

export function IconGlyph({ id, size = 22 }: { id?: string; size?: number }) {
  const icon = findIcon(id);
  if (!icon) return null;
  return (
    <span className="icon-glyph" data-icon={icon.id}>
      {icon.lucide ? (
        <icon.lucide size={size} strokeWidth={1.6} aria-hidden />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={`#${icon.simple!.hex}`}
          aria-hidden
        >
          <path d={icon.simple!.path} />
        </svg>
      )}
    </span>
  );
}
