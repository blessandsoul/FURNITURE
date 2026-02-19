import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ─── 1. Users ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atlas.ge' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Atlas',
      email: 'admin@atlas.ge',
      phone: '+995555000001',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: {},
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'user@user.com',
      phone: '+995555000002',
      passwordHash,
      role: 'USER',
    },
  });

  console.log('Seeded users:', { admin: admin.email, user: user.email });

  // ─── 2. Sofa Category ─────────────────────────────────────
  const sofa = await prisma.furnitureCategory.upsert({
    where: { slug: 'sofa' },
    update: {},
    create: {
      name: 'Sofa',
      slug: 'sofa',
      description: 'Custom-designed sofas crafted to your exact specifications. Choose your preferred style, material, color, and comfort options.',
      basePrice: 500,
      currency: 'GEL',
      isActive: true,
      sortOrder: 0,
      translations: {
        ka: { name: 'დივანი', description: 'ინდივიდუალურად დიზაინირებული დივნები თქვენი ზუსტი სპეციფიკაციების მიხედვით. აირჩიეთ სტილი, მასალა, ფერი და კომფორტის ვარიანტები.' },
        ru: { name: 'Диван', description: 'Диваны, разработанные по вашим точным спецификациям. Выберите стиль, материал, цвет и варианты комфорта.' },
      },
    },
  });

  console.log('Seeded category:', sofa.name);

  // ─── 3. Option Groups & Values ─────────────────────────────

  // Helper to upsert a group + its values
  async function seedGroup(
    group: { name: string; slug: string; description: string; isRequired: boolean; sortOrder: number; translations?: Record<string, Record<string, string>> },
    values: { label: string; slug: string; description?: string; priceModifier: number; colorHex?: string; promptHint: string; sortOrder: number; translations?: Record<string, Record<string, string>> }[],
  ): Promise<void> {
    const created = await prisma.optionGroup.upsert({
      where: { categoryId_slug: { categoryId: sofa.id, slug: group.slug } },
      update: {},
      create: {
        categoryId: sofa.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        isRequired: group.isRequired,
        sortOrder: group.sortOrder,
        translations: group.translations ?? undefined,
      },
    });

    for (const v of values) {
      await prisma.optionValue.upsert({
        where: { groupId_slug: { groupId: created.id, slug: v.slug } },
        update: {},
        create: {
          groupId: created.id,
          label: v.label,
          slug: v.slug,
          description: v.description,
          priceModifier: v.priceModifier,
          colorHex: v.colorHex,
          promptHint: v.promptHint,
          sortOrder: v.sortOrder,
          translations: v.translations ?? undefined,
        },
      });
    }

    console.log(`  Seeded group: ${group.name} (${values.length} values)`);
  }

  // --- Color ---
  await seedGroup(
    {
      name: 'Color',
      slug: 'color',
      description: 'Choose the primary color of your sofa upholstery',
      isRequired: true,
      sortOrder: 0,
      translations: { ka: { name: 'ფერი', description: 'აირჩიეთ თქვენი დივნის ძირითადი ფერი' }, ru: { name: 'Цвет', description: 'Выберите основной цвет обивки дивана' } },
    },
    [
      { label: 'Navy Blue', slug: 'navy-blue', priceModifier: 0, colorHex: '#1B3A5C', promptHint: 'deep navy blue colored upholstery', sortOrder: 0, translations: { ka: { label: 'მუქი ლურჯი' }, ru: { label: 'Тёмно-синий' } } },
      { label: 'Charcoal Gray', slug: 'charcoal-gray', priceModifier: 0, colorHex: '#36454F', promptHint: 'dark charcoal gray colored upholstery', sortOrder: 1, translations: { ka: { label: 'მუქი ნაცრისფერი' }, ru: { label: 'Угольно-серый' } } },
      { label: 'Forest Green', slug: 'forest-green', priceModifier: 20, colorHex: '#228B22', promptHint: 'rich forest green colored upholstery', sortOrder: 2, translations: { ka: { label: 'ტყის მწვანე' }, ru: { label: 'Тёмно-зелёный' } } },
      { label: 'Burgundy', slug: 'burgundy', priceModifier: 20, colorHex: '#800020', promptHint: 'deep burgundy wine-red colored upholstery', sortOrder: 3, translations: { ka: { label: 'ბურგუნდი' }, ru: { label: 'Бордовый' } } },
      { label: 'Cream', slug: 'cream', priceModifier: 0, colorHex: '#FFFDD0', promptHint: 'warm cream off-white colored upholstery', sortOrder: 4, translations: { ka: { label: 'კრემი' }, ru: { label: 'Кремовый' } } },
      { label: 'Cognac', slug: 'cognac', priceModifier: 30, colorHex: '#9A463D', promptHint: 'warm cognac brown colored upholstery', sortOrder: 5, translations: { ka: { label: 'კონიაკი' }, ru: { label: 'Коньячный' } } },
      { label: 'Slate Blue', slug: 'slate-blue', priceModifier: 10, colorHex: '#6A7B8B', promptHint: 'muted slate blue colored upholstery', sortOrder: 6, translations: { ka: { label: 'ფიქალის ლურჯი' }, ru: { label: 'Серо-голубой' } } },
      { label: 'Terracotta', slug: 'terracotta', priceModifier: 15, colorHex: '#CC5533', promptHint: 'earthy terracotta orange-brown colored upholstery', sortOrder: 7, translations: { ka: { label: 'ტერაკოტა' }, ru: { label: 'Терракотовый' } } },
      { label: 'Olive', slug: 'olive', priceModifier: 10, colorHex: '#556B2F', promptHint: 'muted olive green colored upholstery', sortOrder: 8, translations: { ka: { label: 'ზეთისხილისფერი' }, ru: { label: 'Оливковый' } } },
      { label: 'Mustard', slug: 'mustard', priceModifier: 15, colorHex: '#E1AD01', promptHint: 'warm mustard yellow colored upholstery', sortOrder: 9, translations: { ka: { label: 'მდოგვისფერი' }, ru: { label: 'Горчичный' } } },
    ],
  );

  // --- Material ---
  await seedGroup(
    {
      name: 'Material',
      slug: 'material',
      description: 'Select the upholstery material',
      isRequired: true,
      sortOrder: 1,
      translations: { ka: { name: 'მასალა', description: 'აირჩიეთ გარეკანის მასალა' }, ru: { name: 'Материал', description: 'Выберите материал обивки' } },
    },
    [
      { label: 'Italian Leather', slug: 'italian-leather', priceModifier: 350, promptHint: 'premium Italian full-grain leather upholstery with natural grain texture', sortOrder: 0, translations: { ka: { label: 'იტალიური ტყავი' }, ru: { label: 'Итальянская кожа' } } },
      { label: 'Velvet', slug: 'velvet', priceModifier: 150, promptHint: 'luxurious soft velvet upholstery with rich sheen and plush texture', sortOrder: 1, translations: { ka: { label: 'ხავერდი' }, ru: { label: 'Бархат' } } },
      { label: 'Linen', slug: 'linen', priceModifier: 80, promptHint: 'natural linen fabric upholstery with subtle woven texture', sortOrder: 2, translations: { ka: { label: 'სელი' }, ru: { label: 'Лён' } } },
      { label: 'Cotton', slug: 'cotton', priceModifier: 0, promptHint: 'durable cotton fabric upholstery with smooth finish', sortOrder: 3, translations: { ka: { label: 'ბამბა' }, ru: { label: 'Хлопок' } } },
      { label: 'Microfiber', slug: 'microfiber', priceModifier: 60, promptHint: 'stain-resistant microfiber suede-like upholstery', sortOrder: 4, translations: { ka: { label: 'მიკროფიბრა' }, ru: { label: 'Микрофибра' } } },
      { label: 'Bouclé', slug: 'boucle', priceModifier: 200, promptHint: 'textured bouclé wool-blend upholstery with characteristic looped yarn', sortOrder: 5, translations: { ka: { label: 'ბუკლე' }, ru: { label: 'Букле' } } },
    ],
  );

  // --- Size ---
  await seedGroup(
    {
      name: 'Size',
      slug: 'size',
      description: 'Choose the sofa size and seating configuration',
      isRequired: true,
      sortOrder: 2,
      translations: { ka: { name: 'ზომა', description: 'აირჩიეთ დივნის ზომა' }, ru: { name: 'Размер', description: 'Выберите размер дивана' } },
    },
    [
      { label: '2-Seat', slug: '2-seat', priceModifier: 0, description: 'Compact loveseat, approx. 150cm wide', promptHint: 'compact two-seater loveseat sofa', sortOrder: 0, translations: { ka: { label: '2-ადგილიანი' }, ru: { label: '2-местный' } } },
      { label: '3-Seat', slug: '3-seat', priceModifier: 200, description: 'Standard sofa, approx. 220cm wide', promptHint: 'standard three-seater sofa', sortOrder: 1, translations: { ka: { label: '3-ადგილიანი' }, ru: { label: '3-местный' } } },
      { label: 'L-Shaped', slug: 'l-shaped', priceModifier: 500, description: 'Corner sectional, approx. 280x200cm', promptHint: 'L-shaped corner sectional sofa with chaise lounge', sortOrder: 2, translations: { ka: { label: 'L-ფორმის' }, ru: { label: 'Угловой (L)' } } },
      { label: 'U-Shaped', slug: 'u-shaped', priceModifier: 800, description: 'Large sectional, approx. 320x220cm', promptHint: 'large U-shaped sectional sofa', sortOrder: 3, translations: { ka: { label: 'U-ფორმის' }, ru: { label: 'П-образный (U)' } } },
    ],
  );

  // --- Leg Style ---
  await seedGroup(
    {
      name: 'Leg Style',
      slug: 'leg-style',
      description: 'Choose the leg style for your sofa',
      isRequired: true,
      sortOrder: 3,
      translations: { ka: { name: 'ფეხის სტილი', description: 'აირჩიეთ დივნის ფეხების სტილი' }, ru: { name: 'Тип ножек', description: 'Выберите стиль ножек дивана' } },
    },
    [
      { label: 'Wooden Tapered', slug: 'wooden-tapered', priceModifier: 0, promptHint: 'mid-century modern tapered wooden legs in walnut finish', sortOrder: 0, translations: { ka: { label: 'ხის კონუსური' }, ru: { label: 'Деревянные конусные' } } },
      { label: 'Metal Hairpin', slug: 'metal-hairpin', priceModifier: 30, promptHint: 'slim black metal hairpin legs', sortOrder: 1, translations: { ka: { label: 'მეტალის ჰეარპინი' }, ru: { label: 'Металлические шпильки' } } },
      { label: 'Chrome', slug: 'chrome', priceModifier: 50, promptHint: 'polished chrome metal legs with modern finish', sortOrder: 2, translations: { ka: { label: 'ქრომი' }, ru: { label: 'Хромированные' } } },
      { label: 'No Legs / Floor', slug: 'no-legs-floor', priceModifier: -20, promptHint: 'floor-level sofa with no visible legs, sitting directly on the ground', sortOrder: 3, translations: { ka: { label: 'ფეხების გარეშე' }, ru: { label: 'Без ножек' } } },
      { label: 'Wooden Block', slug: 'wooden-block', priceModifier: 20, promptHint: 'solid wooden block legs in natural oak finish', sortOrder: 4, translations: { ka: { label: 'ხის ბლოკი' }, ru: { label: 'Деревянные кубические' } } },
    ],
  );

  // --- Upholstery Type ---
  await seedGroup(
    {
      name: 'Upholstery Type',
      slug: 'upholstery-type',
      description: 'How the fabric covers the sofa frame',
      isRequired: true,
      sortOrder: 4,
      translations: { ka: { name: 'გარეკანის ტიპი', description: 'როგორ ფარავს ქსოვილი ჩარჩოს' }, ru: { name: 'Тип обивки', description: 'Как ткань покрывает каркас' } },
    },
    [
      { label: 'Full Upholstery', slug: 'full-upholstery', priceModifier: 0, promptHint: 'fully upholstered sofa with fabric covering the entire frame', sortOrder: 0, translations: { ka: { label: 'სრული გარეკანი' }, ru: { label: 'Полная обивка' } } },
      { label: 'Semi-Upholstery', slug: 'semi-upholstery', priceModifier: -30, promptHint: 'semi-upholstered sofa with exposed wooden or metal frame accents', sortOrder: 1, translations: { ka: { label: 'ნაწილობრივი გარეკანი' }, ru: { label: 'Частичная обивка' } } },
      { label: 'Loose Covers', slug: 'loose-covers', priceModifier: 40, promptHint: 'sofa with removable loose slipcovers for easy washing', sortOrder: 2, translations: { ka: { label: 'მოსახსნელი საფარი' }, ru: { label: 'Съёмные чехлы' } } },
      { label: 'Fixed', slug: 'fixed', priceModifier: 0, promptHint: 'sofa with tightly fitted fixed upholstery', sortOrder: 3, translations: { ka: { label: 'ფიქსირებული' }, ru: { label: 'Фиксированная' } } },
    ],
  );

  // --- Arm Type ---
  await seedGroup(
    {
      name: 'Arm Type',
      slug: 'arm-type',
      description: 'Choose the arm style of your sofa',
      isRequired: true,
      sortOrder: 5,
      translations: { ka: { name: 'სახელურის ტიპი', description: 'აირჩიეთ სახელურის სტილი' }, ru: { name: 'Тип подлокотников', description: 'Выберите стиль подлокотников' } },
    },
    [
      { label: 'Rolled', slug: 'rolled', priceModifier: 30, promptHint: 'classic rolled arms with curved outward scroll', sortOrder: 0, translations: { ka: { label: 'მოხვეული' }, ru: { label: 'Закруглённые' } } },
      { label: 'Square', slug: 'square', priceModifier: 0, promptHint: 'clean modern square flat arms', sortOrder: 1, translations: { ka: { label: 'კვადრატული' }, ru: { label: 'Прямые' } } },
      { label: 'Pillow', slug: 'pillow', priceModifier: 20, promptHint: 'soft padded pillow-top arms', sortOrder: 2, translations: { ka: { label: 'ბალიშური' }, ru: { label: 'Подушечные' } } },
      { label: 'Track', slug: 'track', priceModifier: 10, promptHint: 'slim track arms aligned with the sofa back height', sortOrder: 3, translations: { ka: { label: 'ვიწრო' }, ru: { label: 'Узкие' } } },
    ],
  );

  // --- Back Style ---
  await seedGroup(
    {
      name: 'Back Style',
      slug: 'back-style',
      description: 'Choose the back cushion style',
      isRequired: true,
      sortOrder: 6,
      translations: { ka: { name: 'ზურგის სტილი', description: 'აირჩიეთ ზურგის ბალიშის სტილი' }, ru: { name: 'Стиль спинки', description: 'Выберите стиль подушки спинки' } },
    },
    [
      { label: 'Tight Back', slug: 'tight-back', priceModifier: 0, promptHint: 'tight fitted back with no separate cushions, smooth clean look', sortOrder: 0, translations: { ka: { label: 'მჭიდრო ზურგი' }, ru: { label: 'Гладкая спинка' } } },
      { label: 'Loose Cushion', slug: 'loose-cushion', priceModifier: 40, promptHint: 'loose back cushions that can be rearranged and fluffed', sortOrder: 1, translations: { ka: { label: 'თავისუფალი ბალიში' }, ru: { label: 'Съёмные подушки' } } },
      { label: 'Tufted', slug: 'tufted', priceModifier: 80, promptHint: 'classic button-tufted back with deep diamond pattern', sortOrder: 2, translations: { ka: { label: 'ტაფტინგი' }, ru: { label: 'Каретная стяжка' } } },
      { label: 'Pillow Back', slug: 'pillow-back', priceModifier: 50, promptHint: 'plush oversized pillow-style back cushions for maximum comfort', sortOrder: 3, translations: { ka: { label: 'ბალიშის ზურგი' }, ru: { label: 'Подушечная спинка' } } },
    ],
  );

  // --- Cushion Type ---
  await seedGroup(
    {
      name: 'Cushion Type',
      slug: 'cushion-type',
      description: 'Select the seat cushion fill material',
      isRequired: true,
      sortOrder: 7,
      translations: { ka: { name: 'ბალიშის ტიპი', description: 'აირჩიეთ სავარძლის ბალიშის შემავსებელი' }, ru: { name: 'Тип наполнителя', description: 'Выберите наполнитель сидения' } },
    },
    [
      { label: 'High-Density Foam', slug: 'high-density-foam', priceModifier: 0, description: 'Durable supportive foam, holds shape well', promptHint: 'high-density foam seat cushions with firm support', sortOrder: 0, translations: { ka: { label: 'მაღალი სიმკვრივის ქაფი' }, ru: { label: 'Пенополиуретан' } } },
      { label: 'Feather-Down', slug: 'feather-down', priceModifier: 120, description: 'Soft luxury feel, requires occasional fluffing', promptHint: 'luxurious feather and down filled seat cushions with soft sink-in feel', sortOrder: 1, translations: { ka: { label: 'ბუმბული' }, ru: { label: 'Перо-пух' } } },
      { label: 'Pocket Spring', slug: 'pocket-spring', priceModifier: 80, description: 'Individual springs for responsive comfort', promptHint: 'pocket spring seat cushions with responsive comfort and bounce', sortOrder: 2, translations: { ka: { label: 'ჯიბის ზამბარა' }, ru: { label: 'Пружинный блок' } } },
    ],
  );

  // --- Seat Depth ---
  await seedGroup(
    {
      name: 'Seat Depth',
      slug: 'seat-depth',
      description: 'Standard or deep seat for lounging',
      isRequired: true,
      sortOrder: 8,
      translations: { ka: { name: 'სავარძლის სიღრმე', description: 'სტანდარტული ან ღრმა სავარძელი' }, ru: { name: 'Глубина сидения', description: 'Стандартная или глубокая посадка' } },
    },
    [
      { label: 'Standard', slug: 'standard', priceModifier: 0, description: 'Standard depth (~55cm), upright sitting', promptHint: 'standard seat depth sofa for upright comfortable sitting', sortOrder: 0, translations: { ka: { label: 'სტანდარტული' }, ru: { label: 'Стандартная' } } },
      { label: 'Deep', slug: 'deep', priceModifier: 60, description: 'Deep seat (~70cm), for lounging', promptHint: 'deep seat sofa designed for relaxed lounging with extra depth', sortOrder: 1, translations: { ka: { label: 'ღრმა' }, ru: { label: 'Глубокая' } } },
    ],
  );

  // --- Firmness ---
  await seedGroup(
    {
      name: 'Firmness',
      slug: 'firmness',
      description: 'Choose the overall firmness level',
      isRequired: true,
      sortOrder: 9,
      translations: { ka: { name: 'სიმაგრე', description: 'აირჩიეთ სიმაგრის დონე' }, ru: { name: 'Жёсткость', description: 'Выберите уровень жёсткости' } },
    },
    [
      { label: 'Firm', slug: 'firm', priceModifier: 0, promptHint: 'firm structured sofa with solid supportive feel', sortOrder: 0, translations: { ka: { label: 'მაგარი' }, ru: { label: 'Жёсткий' } } },
      { label: 'Medium', slug: 'medium', priceModifier: 0, promptHint: 'medium firmness sofa balancing support and comfort', sortOrder: 1, translations: { ka: { label: 'საშუალო' }, ru: { label: 'Средний' } } },
      { label: 'Soft', slug: 'soft', priceModifier: 30, promptHint: 'soft plush sofa with sink-in comfort', sortOrder: 2, translations: { ka: { label: 'რბილი' }, ru: { label: 'Мягкий' } } },
    ],
  );

  console.log('Seeded 10 option groups with values');

  // ─── 4. Credit Packages ────────────────────────────────────
  const existingPackages = await prisma.creditPackage.count();
  if (existingPackages === 0) {
    await prisma.creditPackage.createMany({
      data: [
        { name: 'Starter', credits: 5, price: 10, currency: 'GEL', description: '5 AI generation credits — perfect for trying out the designer', sortOrder: 0 },
        { name: 'Pro', credits: 20, price: 35, currency: 'GEL', description: '20 AI generation credits — best value for serious designers', sortOrder: 1 },
        { name: 'Business', credits: 50, price: 75, currency: 'GEL', description: '50 AI generation credits — for professional use and bulk design projects', sortOrder: 2 },
      ],
    });
  }

  console.log('Seeded 3 credit packages');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
