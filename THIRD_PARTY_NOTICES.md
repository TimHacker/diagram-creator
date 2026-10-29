# Third-Party Notices: Icon Packs

Diagram Creator bundles two icon packs into the application. Icons are compiled into the JavaScript bundle; no icons are fetched at runtime, so adding icons and PNG export work without network access once the app has loaded.

Versions below are the installed versions at the time of writing; check `package-lock.json` for the exact versions in a given build.

## Generic architecture: Lucide

- Package: [`lucide-react`](https://lucide.dev) 1.64.0
- Licence: ISC (some icons derived from Feather, MIT)
- Icons used: monitor, smartphone, user, route, network, globe, server, container, square-function, database, zap, layers-2, hard-drive, warehouse, search, key-round, shield, activity, scroll-text, clock, mail, plug, cloud.

```text
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Cloud & platforms: Simple Icons

- Package: [`simple-icons`](https://simpleicons.org) 16.36.0
- Licence: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- Only icons without a separate per-icon licence in Simple Icons' data are included. For example, Apache Kafka is excluded because its icon is Apache-2.0 licensed. The acceptance suite checks this for every bundled icon.

### Trademarks

The CC0 dedication covers the Simple Icons project's copyright interest. It does not grant trademark rights. Each logo is a trademark of its respective owner and is shown only to identify that product in a diagram, without implying endorsement. Users must follow each brand's guidelines. See the [Simple Icons disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md).

AWS and Microsoft Azure logos are not included: they are not available from Simple Icons, and the terms for their official architecture icon sets do not clearly permit redistribution within this public application.

### Icons and Sources

| Icon                 | Slug                 | Source                                                                                                                                               |
| -------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Cloud         | `googlecloud`        | <https://cloud.google.com>                                                                                                                           |
| Google Cloud Storage | `googlecloudstorage` | <https://cloud.google.com/icons>                                                                                                                     |
| Google Cloud Spanner | `googlecloudspanner` | <https://cloud.google.com/icons>                                                                                                                     |
| Google BigQuery      | `googlebigquery`     | <https://cloud.google.com/icons>                                                                                                                     |
| Firebase             | `firebase`           | <https://firebase.google.com/brand-guidelines>                                                                                                       |
| Cloudflare           | `cloudflare`         | <https://www.cloudflare.com/logo/>                                                                                                                   |
| Cloudflare Workers   | `cloudflareworkers`  | <https://www.cloudflare.com/developer-platform/products/>                                                                                            |
| Alibaba Cloud        | `alibabacloud`       | <https://www.alibabagroup.com/en/ir/reports>                                                                                                         |
| DigitalOcean         | `digitalocean`       | <https://www.digitalocean.com/press/>                                                                                                                |
| Hetzner              | `hetzner`            | <https://www.hetzner.com>                                                                                                                            |
| Vercel               | `vercel`             | <https://vercel.com/geist/brands>                                                                                                                    |
| Netlify              | `netlify`            | <https://www.netlify.com/press/>                                                                                                                     |
| Supabase             | `supabase`           | <https://github.com/supabase/supabase/blob/4031a7549f5d46da7bc79c01d56be4177dc7c114/packages/common/assets/images/supabase-logo-wordmark--light.svg> |
| Kubernetes           | `kubernetes`         | <https://github.com/kubernetes/kubernetes/tree/cac53883f4714452f3084a22e4be20d042a9df33/logo>                                                        |
| Docker               | `docker`             | <https://www.docker.com/company/newsroom/media-resources>                                                                                            |
| Helm                 | `helm`               | <https://helm.sh>                                                                                                                                    |
| Terraform            | `terraform`          | <https://www.hashicorp.com/brand>                                                                                                                    |
| NGINX                | `nginx`              | <https://www.nginx.com/press/>                                                                                                                       |
| PostgreSQL           | `postgresql`         | <https://wiki.postgresql.org/wiki/Logo>                                                                                                              |
| MySQL                | `mysql`              | <https://www.mysql.com/about/legal/logos.html>                                                                                                       |
| MongoDB              | `mongodb`            | <https://www.mongodb.com/pressroom>                                                                                                                  |
| Redis                | `redis`              | <https://redis.io/brand-guidelines>                                                                                                                  |
| RabbitMQ             | `rabbitmq`           | <https://www.rabbitmq.com>                                                                                                                           |
| Elasticsearch        | `elasticsearch`      | <https://www.elastic.co/brand>                                                                                                                       |
| Grafana              | `grafana`            | <https://grafana.com>                                                                                                                                |
| Prometheus           | `prometheus`         | <https://prometheus.io>                                                                                                                              |
| GitHub               | `github`             | <https://github.com/logos>                                                                                                                           |
