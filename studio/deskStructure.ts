import type { IconType } from 'react-icons';
import {
  LuBookMarked,
  LuBug,
  LuFileStack,
  LuFolderOpen,
  LuHouse,
  LuImage,
  LuLayoutTemplate,
  LuMapPin,
  LuNotebookPen,
  LuPhoneCall,
  LuSettings2,
  LuShieldCheck,
  LuTag,
  LuUserRound
} from 'react-icons/lu';
import type { ListItemBuilder, StructureResolver } from 'sanity/structure';

const API_VERSION = '2024-05-01';

const PAGE_GROUPS = [
  { title: 'Pest Control', value: 'pest-control', icon: LuShieldCheck },
  { title: 'Bed Bug Treatment', value: 'bed-bug-treatment', icon: LuBug },
  { title: 'Service Area', value: 'service-area', icon: LuMapPin },
  { title: 'Contact', value: 'contact', icon: LuPhoneCall },
  { title: 'Blog', value: 'blog', icon: LuBookMarked },
  { title: 'Home', value: 'home', icon: LuHouse }
];

const deskStructure: StructureResolver = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });

  const buildTaxonomyPane = ({
    title,
    icon,
    schemaType,
    values,
    filter
  }: {
    title: string;
    icon: IconType;
    schemaType: string;
    values: Promise<Array<{ _id: string; name?: string }>>;
    filter: string;
  }): ListItemBuilder =>
    S.listItem()
      .title(title)
      .icon(icon)
      .id(`taxonomy-${schemaType}`)
      .child(async () => {
        const items = (await values)
          .map(({ _id, name }) => ({ id: _id, name: name?.trim() ?? '' }))
          .filter(({ id, name }) => Boolean(id) && Boolean(name))
          .sort((a, b) => a.name.localeCompare(b.name));

        const children: (ListItemBuilder | ReturnType<typeof S.divider>)[] = [
          S.listItem()
            .title(`Manage ${title}`)
            .id(`manage-${schemaType}`)
            .icon(icon)
            .schemaType(schemaType)
            .child(
              S.documentTypeList(schemaType)
                .title(`All ${title}`)
                .filter('_type == $schemaType')
                .params({ schemaType })
                .defaultOrdering([{ field: 'name', direction: 'asc' }])
            )
        ];

        if (items.length) {
          children.push(S.divider());
          children.push(
            ...items.map(({ id, name }, idx) =>
              S.listItem()
                .title(name)
                .id(`${schemaType}-item-${idx}`)
                .child(
                  S.documentList()
                    .title(name)
                    .schemaType('blogPost')
                    .filter(filter)
                    .params({ refId: id })
                )
            )
          );
        }

        return S.list()
          .title(title)
          .items(children);
      });

  const buildServiceAreaPane = () =>
    S.listItem()
      .title('Service Area')
      .icon(LuMapPin)
      .child(async () => {
        // Get service area folders
        const folders = await client.fetch(
          '*[_type == "serviceAreaFolder"] | order(order asc, name asc) { _id, name }'
        );

        const folderItems = (folders as Array<{ _id: string; name: string }>).map((folder) =>
          S.listItem()
            .title(folder.name)
            .id(`folder_${folder._id}`)
            .child(
              S.documentTypeList('page')
                .title(`${folder.name} Pages`)
                .filter('_type == "page" && pageType == "service-area" && slug.current match $prefix')
                .params({ prefix: `service-area/${folder.name.toLowerCase().replace(/\\s+/g, '-')}/*` })
            )
        );

        // Get existing pages to extract area keys (for dynamic areas not in folders)
        const entries: Array<{ title?: string; slug?: string; _id?: string }> =
          (await client.fetch(
            '*[_type == "page" && pageType == "service-area" && defined(slug.current)]{title, "slug": slug.current, _id}'
          )) ?? [];

        const normalized = entries
          .map((e) => ({
            ...e,
            slug: (e.slug || '').replace(/^\/+|\/+$/g, '')
          }))
          .filter((e) => e.slug);

        const areaKeys = Array.from(
          new Set(
            normalized.map((e) => {
              const parts = e.slug!.split('/');
              if (parts[0] === 'service-area' && parts[1]) return parts[1];
              return parts[0];
            })
          )
        ).sort();

        // Filter out areas that already have folders
        const folderNames = new Set((folders as Array<{ name: string }>).map(f => f.name.toLowerCase().replace(/\s+/g, '-')));
        const dynamicAreaKeys = areaKeys.filter(key => !folderNames.has(key));

        const dynamicAreaItems = dynamicAreaKeys.map((area) => {
          const sanitizedId = area.replace(/[^a-zA-Z0-9]/g, '');
          return S.listItem()
            .title(area.replace(/-/g, ' '))
            .id(`area${sanitizedId}`)
            .child(
              S.documentTypeList('page')
                .title(`${area.replace(/-/g, ' ')} Pages`)
                .filter('_type == "page" && slug.current match $prefix')
                .params({ prefix: `service-area/${area}/*` })
            );
        });

        return S.list()
          .title('Service Area')
          .items([
            S.listItem()
              .title('Add New Folder')
              .icon(LuFolderOpen)
              .schemaType('serviceAreaFolder')
              .child(S.documentTypeList('serviceAreaFolder').title('Add New Folder')),
            S.divider(),
            S.listItem()
              .title('All Service Area Pages')
              .icon(LuFileStack)
              .schemaType('page')
              .child(
                S.documentTypeList('page')
                  .title('All Service Area Pages')
                  .filter('_type == "page" && pageType == "service-area"')
              ),
            S.divider(),
            ...folderItems,
            ...(dynamicAreaItems.length > 0 ? [S.divider(), ...dynamicAreaItems] : [])
          ]);
      });

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(LuLayoutTemplate)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('All Pages')
                .icon(LuFileStack)
                .schemaType('page')
                .child(S.documentTypeList('page').title('All Pages')),
              S.divider(),
              buildServiceAreaPane(),
              S.divider(),
              ...PAGE_GROUPS.filter(({ value }) => value !== 'service-area').map(({ title, value, icon }) =>
                S.listItem()
                  .title(title)
                  .icon(icon)
                  .schemaType('page')
                  .child(
                    S.documentTypeList('page')
                      .title(`${title} Pages`)
                      .filter('_type == "page" && pageType == $pageType')
                      .params({ pageType: value })
                  )
              )
            ])
        ),
      S.listItem()
        .title('Posts')
        .icon(LuNotebookPen)
        .schemaType('blogPost')
        .child(S.documentTypeList('blogPost').title('Posts')),
      S.listItem()
        .title('Media')
        .icon(LuImage)
        .child(S.documentTypeList('sanity.imageAsset').title('All Media')),
      S.divider(),
      S.listItem()
        .title('Global Settings')
        .icon(LuSettings2)
        .schemaType('globalSettings')
        .child(S.document().schemaType('globalSettings').documentId('global-settings')),
      S.divider(),
      S.listItem()
        .title('All Categories')
        .icon(LuFolderOpen)
        .schemaType('category')
        .child(S.documentTypeList('category').title('All Categories')),
      buildTaxonomyPane({
        title: 'Tags',
        icon: LuTag,
        schemaType: 'tag',
        values: client.fetch<Array<{ _id: string; name?: string }>>('*[_type == "tag"] | order(name asc) { _id, name }'),
        filter: '_type == "blogPost" && references($refId)'
      }),
      S.listItem()
        .title('Authors')
        .icon(LuUserRound)
        .schemaType('author')
        .child(S.documentTypeList('author').title('Authors')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) =>
        ![
          'page',
          'blogPost',
          'globalSettings',
          'sanity.imageAsset',
          'sanity.fileAsset',
          'category',
          'tag',
          'author'
        ].includes(item.getId() ?? '')
      )
    ]);
};

export default deskStructure;
