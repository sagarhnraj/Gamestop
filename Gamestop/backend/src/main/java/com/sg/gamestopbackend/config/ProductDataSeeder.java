package com.sg.gamestopbackend.config;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.ProductImage;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.repository.ProductImageRepository;
import com.sg.gamestopbackend.repository.ProductRepository;

@Component
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductDataSeeder(ProductRepository productRepository, 
                             CategoryRepository categoryRepository,
                             ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedCategories();
        seedProductsAndImages();

        Map<Integer, ProductUpdateInfo> updates = getProductUpdates();
        for (Map.Entry<Integer, ProductUpdateInfo> entry : updates.entrySet()) {
            Integer productId = entry.getKey();
            ProductUpdateInfo info = entry.getValue();

            Optional<Product> optionalProduct = productRepository.findById(productId);
            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();
                product.setPrice(info.price);
                product.setDescription(info.description);
                productRepository.save(product);
            }
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            Category c1 = new Category(1, "Gaming Consoles");
            Category c2 = new Category(2, "Games");
            Category c3 = new Category(3, "Gaming Accessories");
            Category c4 = new Category(4, "Gaming Setup");
            categoryRepository.saveAll(List.of(c1, c2, c3, c4));
        }
    }

    private void seedProductsAndImages() {
        if (productRepository.count() == 0) {
            Map<Integer, Category> categories = new HashMap<>();
            categoryRepository.findAll().forEach(c -> categories.put(c.getCategoryId(), c));

            List<ProductSeedInfo> seeds = getProductSeeds();
            for (ProductSeedInfo seed : seeds) {
                Product p = new Product();
                p.setProductId(seed.id);
                p.setName(seed.name);
                p.setDescription(seed.description);
                p.setPrice(BigDecimal.valueOf(seed.price));
                p.setStock(1);
                p.setCategory(categories.get(seed.categoryId));
                productRepository.save(p);

                if (seed.imageUrl != null && !seed.imageUrl.isEmpty()) {
                    ProductImage img = new ProductImage();
                    img.setProduct(p);
                    img.setImageUrl(seed.imageUrl);
                    productImageRepository.save(img);
                }
            }
        }
    }

    private static class ProductSeedInfo {
        int id;
        String name;
        String description;
        double price;
        int categoryId;
        String imageUrl;

        ProductSeedInfo(int id, String name, String description, double price, int categoryId, String imageUrl) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.price = price;
            this.categoryId = categoryId;
            this.imageUrl = imageUrl;
        }
    }

    private List<ProductSeedInfo> getProductSeeds() {
        return List.of(
            // Consoles (Category 1)
            new ProductSeedInfo(101, "Xbox VR", "Next-generation immersive virtual reality headset designed for Xbox.", 39990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/Xbox%20VR.webp?updatedAt=1785152019525"),
            new ProductSeedInfo(102, "PS5 Pro", "Experience ultra-high definition gaming with enhanced GPU performance.", 69990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20pro.webp?updatedAt=1785152019514"),
            new ProductSeedInfo(103, "Steam Deck", "Powerful portable PC gaming handheld powered by a custom AMD APU.", 49990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/steam%20deck.jpg?updatedAt=1785152019425"),
            new ProductSeedInfo(104, "PS5 Spidey Edition", "Limited edition Marvel Spider-Man 2 PlayStation 5 console bundle.", 59990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Spidey%20edition.jpg?updatedAt=1785152019417"),
            new ProductSeedInfo(105, "PS5 Slim", "Sleek and compact design delivering the full power of PlayStation 5.", 44990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Slim.webp?updatedAt=1785152019515"),
            new ProductSeedInfo(106, "AYA NEO 2S", "Premium handheld gaming PC equipped with AMD Ryzen 7 7840U processor.", 79990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%202S.jpg?updatedAt=1785152019431"),
            new ProductSeedInfo(107, "ROG Ally", "High-performance Windows 11 handheld console powered by AMD Z1 Extreme chip.", 59990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/rog%20ally.jpg?updatedAt=1785152019404"),
            new ProductSeedInfo(108, "Xbox Series S", "All-digital next-gen console offering fast load times and up to 120 FPS gameplay.", 31990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/xbox%20series%20S.webp?updatedAt=1785152019482"),
            new ProductSeedInfo(109, "Xbox", "The fastest and most powerful Xbox ever built with 12 teraflops.", 52990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/xbox.webp?updatedAt=1785152019417"),
            new ProductSeedInfo(110, "PS5 Gold Edition", "Collector luxury PlayStation 5 console featuring custom gold accents.", 99990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Gold%20Edition.jpg?updatedAt=1785152019181"),
            new ProductSeedInfo(111, "PS Portal", "Dedicated Remote Play handheld device for streaming your PS5 games over Wi-Fi.", 18990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS%20portal.jpg?updatedAt=1785152019169"),
            new ProductSeedInfo(112, "Nintendo Switch 2", "Next-gen hybrid gaming console with enhanced graphics and magnetic Joy-Cons.", 34990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%202.jpg?updatedAt=1785152019003"),
            new ProductSeedInfo(113, "Nintendo Switch 1", "Hybrid console featuring a vibrant 7-inch OLED screen, wide adjustable stand.", 29990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%201.png?updatedAt=1785152018953"),
            new ProductSeedInfo(114, "MSI Claw", "Advanced handheld gaming device powered by Intel Core Ultra processor.", 64990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/MSI%20claw.jpg?updatedAt=1785152018875"),
            new ProductSeedInfo(115, "AYA NEO Air Plus", "Ultra-compact and lightweight PC gaming handheld designed for comfortable portability.", 44990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%20Air%20plus.jpg?updatedAt=1785152018827"),

            // Games (Category 2)
            new ProductSeedInfo(201, "SONY The Last Of Us Part 1 For PS5", "Rebuilt from the ground up for PS5. Experience emotional storytelling.", 3999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20Of%20Us%20Part%201%20For%20PS5%20(Action-Adventure%20Game,%2050668583,%20Standard%20Edition).webp?updatedAt=1785148697115"),
            new ProductSeedInfo(202, "Sony PS5 Rise Of The Ronin", "Embark on an epic journey across 19th-century war-torn Japan.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Rise%20Of%20The%20Ronin.webp?updatedAt=1785148697040"),
            new ProductSeedInfo(203, "Sony PS5 Grand Theft Auto V", "Experience the blockbuster open-world action in Los Santos.", 2499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Grand%20Theft%20Auto%20V%20|%20Rockstar%20Games%20|%20GTA%20V.webp?updatedAt=1785148697002"),
            new ProductSeedInfo(204, "Sony PS5 Red Dead Redemption", "Relive Arthur Morgan epic tale across the American heartland.", 3299.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Red%20Dead%20Redemption.webp?updatedAt=1785148696984"),
            new ProductSeedInfo(205, "SONY The Last of Us Part 2 Remastered For PS5", "Enhanced native PS5 edition featuring No Return roguelike mode.", 3499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20of%20Us%20Part%202%20Remastered%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-15508).webp?updatedAt=1785148697000"),
            new ProductSeedInfo(206, "SONY God Of War Ragnarok For PS5", "Journey across the Nine Realms with Kratos and Atreus.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20God%20Of%20War%20Ragnarok%20For%20PS5%20(Action%20Games,%20Standard%20Edition,%2050668668).webp?updatedAt=1785148696950"),
            new ProductSeedInfo(207, "Sony PS5 Gran Turismo 7 Standard Edition", "The real driving simulator brought to life with over 400 cars.", 3999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Gran%20Turismo%207%20Standard%20Edition.webp?updatedAt=1785148696990"),
            new ProductSeedInfo(208, "SONY Spiderman 2 For PS5", "Swing through Marvel New York as both Peter Parker and Miles Morales.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20Spiderman%202%20For%20PS5%20(Action-Adventure%20Games,%20Standard%20Edition,%2050668584).webp?updatedAt=1785148696924"),
            new ProductSeedInfo(209, "Sony PS5 Marvel's Wolverine", "Play as the legendary X-Men member Wolverine in an intense action game.", 4999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Marvel's%20Wolverine.webp?updatedAt=1785148696854"),
            new ProductSeedInfo(210, "Sony PS5 EA SPORTS FC 26 Standard Edition", "The world game featuring unmatched realism, HyperMotionV technology.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20EA%20SPORTS%20FC%2026%20Standard%20Edition.webp?updatedAt=1785148696995"),
            new ProductSeedInfo(211, "PS5 Grand Theft Auto VI", "Step into the state of Leonida in the most immersive GTA experience.", 5999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/PS5%C2%AE%20Grand%20Theft%20Auto%20VI%20|%20Rockstar%20Games%20|%20GTA%206%20Standard%20Edition.webp?updatedAt=1785148696820"),
            new ProductSeedInfo(212, "Sony PS5 Assassin's Creed Valhalla", "Become Eivor, a legendary Viking warrior on a quest for glory.", 2999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Assassin's%20Creed%20Valhalla.webp?updatedAt=1785148696812"),
            new ProductSeedInfo(213, "Sony PS5 Uncharted Legacy of Thieves Collection", "Seek your fortune in remastered adventures featuring Nathan Drake.", 2999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Uncharted%20Legacy%20of%20Thieves%20Collection.webp?updatedAt=1785148696868"),
            new ProductSeedInfo(214, "SONY Death Stranding 2 On The Beach For PS5", "Hideo Kojima visionary sci-fi sequel. Reconnect a fractured world.", 4999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20Death%20Stranding%202%20On%20The%20Beach%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-02015).webp?updatedAt=1785148696855"),
            new ProductSeedInfo(215, "Sony PS5 Demon Souls", "Entirely rebuilt from the ground up, experience the dark fantasy classic.", 3499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%20Demon%20Souls.webp?updatedAt=1785148696798"),

            // Accessories (Category 3)
            new ProductSeedInfo(301, "PS5 Vertical Stand", "Official vertical stand designed to securely hold both PS5 Disc and Digital.", 2490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PS5%20Vertical%20Stand.jpg?updatedAt=1785152753606"),
            new ProductSeedInfo(302, "Seagate Storage Expansion Card", "Official 1TB NVMe expansion card for Xbox Series X|S.", 16990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Seagate%20Storage%20Expansion%20Card.jpg?updatedAt=1785152753596"),
            new ProductSeedInfo(303, "WD Black SN850P SSD (PS5)", "Officially licensed 1TB M.2 NVMe SSD for PS5 with pre-installed heatsink.", 12990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/WD%20Black%20SN850P%20SSD%20(PS5).jpg?updatedAt=1785152753614"),
            new ProductSeedInfo(304, "PS5 Spidey Edition Covers", "Official PlayStation 5 console covers featuring Marvel Spider-Man 2 design.", 4990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20spidey%20edition.jpg?updatedAt=1785152753545"),
            new ProductSeedInfo(305, "Xbox Wireless Controller", "Modern ergonomic wireless controller with textured grips and Share button.", 5390.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Xbox%20Wireless%20Controller.avif?updatedAt=1785152753631"),
            new ProductSeedInfo(306, "HD Camera for PS5", "Dual 1080p lenses for picture-in-picture streaming during broadcast.", 4990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/HD%20Camera%20for%20PS5.webp?updatedAt=1785152753604"),
            new ProductSeedInfo(307, "PS5 Gold Edition Controller", "Premium wireless controller featuring metallic gold finish.", 6990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20gold%20edition.webp?updatedAt=1785152753480"),
            new ProductSeedInfo(308, "Nintendo Switch Pro Controller", "Full-sized wireless controller with motion controls, HD rumble.", 5990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Nintendo%20Switch%20Pro%20Controller.avif?updatedAt=1785152753551"),
            new ProductSeedInfo(309, "PlayStation Media Remote", "Convenient media navigation remote with dedicated app launch buttons.", 2490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Media%20Remote.webp?updatedAt=1785152753422"),
            new ProductSeedInfo(310, "KontrolFreek Performance Thumbsticks", "High-rise thumbsticks engineered to increase precision and grip.", 1490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/KontrolFreek%20Performance%20Thumbsticks.jpg?updatedAt=1785152753292"),
            new ProductSeedInfo(311, "PlayStation Access Controller", "Highly customizable accessibility controller kit.", 8990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Access%20Controller.jpg?updatedAt=1785152753119"),
            new ProductSeedInfo(312, "DualSense Charging Station", "Click-in charging dock capable of fast-charging up to two controllers.", 2290.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Charging%20Station.avif?updatedAt=1785152753304"),
            new ProductSeedInfo(313, "Joy-Con Controllers (Neon)", "Pair of vibrant Neon Red and Neon Blue Joy-Con controllers.", 6990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/joy-Con%20Controllers%20(Neon).webp?updatedAt=1785152753258"),
            new ProductSeedInfo(314, "DualSense Wireless Controller", "Innovative PS5 controller featuring haptic feedback and adaptive triggers.", 5790.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Wireless%20Controller.webp?updatedAt=1785152753227"),
            new ProductSeedInfo(315, "Joy-Con Charging Grip", "Ergonomic grip that combines two Joy-Cons into a traditional controller.", 2190.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Joy-Con%20Charging%20Grip.jpg?updatedAt=1785152753070"),

            // Setup (Category 4)
            new ProductSeedInfo(401, "One Piece Luffy Figure", "Premium Banpresto collectible figure showcasing Luffy in an iconic stance.", 3490.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/One%20Piece%20King%20of%20Artist%20The%20Monkey.%20D.%20Luffy%20One%20Piece%20Monkey%20D.%20Luffy%20King%20of%20Artist%20Figure%20Prize%20Banpresto.jpg?updatedAt=1785177280405"),
            new ProductSeedInfo(402, "ARTFX J Uzui Tengen Figure", "Highly detailed 1:8 scale Kotobukiya statue of Uzui Tengen.", 12990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/ARTFX%20J%20Demon%20Slayer%20Uzui%20Tengen%201:8%20Scale%20PVC%20Pre-Painted%20Complete%20Figure%20PV041.jpg?updatedAt=1785177280339"),
            new ProductSeedInfo(403, "Marvel Spider-Man Miles Morales Figure", "12-inch scale action figure of Miles Morales with multiple points of articulation.", 1790.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Marvel%20Spider-Man%20Titan%20Hero%20Series%20Ultimate%20Spiderman(Miles%20Morales)%20Figure.jpg?updatedAt=1785177280094"),
            new ProductSeedInfo(404, "Anime Figures Cute Collectable Model", "Adorable chibi desktop collectible anime figure crafted from durable PVC.", 1290.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Anime%20Figures%20Cartoon%20Character%20Cute%20Model%20Collectable%20Figure%20Birthday%20Creative%20Gift.jpg?updatedAt=1785177279863"),
            new ProductSeedInfo(405, "Bestier L Shaped Gaming Desk", "Reversible L-shaped gaming desk equipped with power sockets and LED.", 14990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Bestier%2051%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets,%20LED%20Workstation%20with%204%20Tiers%20Shelves,%20Carbon%20Fiber%20White.png?updatedAt=1785176703281"),
            new ProductSeedInfo(406, "Eivanet 53inch L Shaped Gaming Desk", "Spacious corner computer desk featuring monitor stand and LED lights.", 15990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%2053inch%20L%20Shaped%20Desk,L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets%20&%20LED%20Lights,%20Computer%20Desk%20with%20Monitor%20Stand%20&%20Storage%20Bag,%20Home%20Office%20Desk%20Corner%20Desk%20with%20Hooks,Carbon%20Fiber%20Black.jpg?updatedAt=1785176701840"),
            new ProductSeedInfo(407, "FIFINE Dynamic Mic Bundle", "Professional streaming microphone setup with dual XLR/USB connectivity.", 7990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/FIFINE%20Gaming%20Dynamic%20Mic%20Bundle-%20XLR:USB%20Mic%20Kit%20with%20RGB%20Boom%20Arm,3%20EQ%20Audio%20Mixer%20with%20Voice%20Changer%20and%2010ft%20XLR%20Cable%20for%20Streaming:Podcast:Game%20Voice%20(AM8PROT+SC8+L9).jpg?updatedAt=1785176701750"),
            new ProductSeedInfo(408, "Eivanet Reversible Gaming Desk", "Ergonomic L-desk with built-in power strip and reversible storage.", 13990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlet%20&%20Led%20Light,%2047%20inch%20Reversible%20Computer%20Desk%20with%20Shelves,%20Hooks,%20and%20Drawer,%20Cornor%20Home%20Office%20Desk%20Table%20for%20Living%20Room,%20Bedroom,%20Black%20.jpg?updatedAt=1785176701790"),
            new ProductSeedInfo(409, "Standing Height Adjustable Gaming Desk", "Heavy-duty dual-motor electric height-adjustable corner desk.", 16990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/L-Shaped%20Gaming%20Desk,%20Large%20Standing%20Desk,%20Study%20&%20Office%20Table,%20Sturdy%20Legs%20and%20Smooth%20Edges,%20Corner%20Computer%20Desk%20with%20Storage%20Shelves%20-%20Perfect%20for%20Bedroom%20and%20Office,%20Black%20Left,%2047.2%20x.jpg?updatedAt=1785176701732"),
            new ProductSeedInfo(410, "Pink Ergonomic Racing Gaming Chair", "Stylish pink and white ergonomic racing chair with memory foam.", 11990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Gaming%20Chair%20Racing%20Ergonomic%20Racing%20Chair%20High%20Back%20PC%20Computer%20Gaming%20Chairs%20with%20Headrest%20Lumbar%20Support%20&%20Flip-up%20Arms%20PU%20Leather%20Adjustable%20Height%20Swivel,%20Pink.jpg?updatedAt=1785176701763"),
            new ProductSeedInfo(411, "Kosker Headset & Controller Stand", "Multi-functional 3-tier desktop organizer stand.", 2490.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Kosker%20Headset%20Stand%203%20Tiers%20for%20Desk,%20Rotatable%20Gaming%20Controller%20Stand%20for%20PS5:PS4:Xbox:Switch2:PS%20Portal:Phone,%20Universal%20PC%20Gamer%20Gift%20Accessory%20Controller:Headphone%20Holder%20for%209%20Packs%20Controller.jpg?updatedAt=1785176701662"),
            new ProductSeedInfo(412, "GTPLAYER Gaming Chair with Speakers", "High-back Esports gaming chair featuring dual Bluetooth wireless speakers.", 14990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Gaming%20Chair%20with%20Speakers,%20Video%20Game%20Chairs%20with%20Footrest,%20PC%20Gamer%20Chairs%20for%20Adults%20-%20Padded%20High%20Back%20Ergonomic%20Reclining%20Silla%20Gamer,%20Linkage%20Armrest,%20Ace%20Pro,%20Blue%20(Velvet).jpg?updatedAt=1785176701597"),
            new ProductSeedInfo(413, "GTPLAYER Big and Tall Gaming Chair", "Heavy-duty gaming chair designed for big and tall gamers.", 17990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Big%20and%20Tall%20Gaming%20Chair%20Ergonomic%20Heavy%20Duty%20Office%20Chair%20Racing%20Seat%20with%20Adjustable%20Lumbar%20Pillow%20Footrest%20150%20Reclining%20Thickened%20Armrests%20Breathable%20Mesh%20for%20Esports:PC%20Gaming%20.jpg?updatedAt=1785176701605"),
            new ProductSeedInfo(414, "Massage Gaming Chair with LED Light", "Ultimate gaming throne equipped with lumbar massage function and RGB.", 18990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445"),
            new ProductSeedInfo(415, "Deluxe Massage Gaming Chair RGB", "Deluxe ergonomic reclining computer chair with massage pillow.", 18990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445")
        );
    }

    private static class ProductUpdateInfo {
        BigDecimal price;
        String description;

        ProductUpdateInfo(double price, String description) {
            this.price = BigDecimal.valueOf(price);
            this.description = description;
        }
    }

    private Map<Integer, ProductUpdateInfo> getProductUpdates() {
        Map<Integer, ProductUpdateInfo> map = new HashMap<>();

        // Consoles (Category 1)
        map.put(101, new ProductUpdateInfo(39990.00, "Next-generation immersive virtual reality headset designed for Xbox. Features dual 4K OLED displays, ultra-precise spatial tracking, and ergonomic headstraps for long gaming sessions."));
        map.put(102, new ProductUpdateInfo(69990.00, "Experience ultra-high definition gaming with enhanced GPU performance and advanced ray tracing. Comes with 2TB high-speed SSD storage and supports up to 120 FPS at 4K resolution."));
        map.put(103, new ProductUpdateInfo(49990.00, "Powerful portable PC gaming handheld powered by a custom AMD APU. Play your full Steam library on the go with a vibrant 7-inch touchscreen and customizable trackpads."));
        map.put(104, new ProductUpdateInfo(59990.00, "Limited edition Marvel Spider-Man 2 PlayStation 5 console bundle. Features custom symbiote takeover side plates and a matching DualSense wireless controller."));
        map.put(105, new ProductUpdateInfo(44990.00, "Sleek and compact design delivering the full power of PlayStation 5. Includes 1TB ultra-fast SSD, ray tracing technology, and 3D Audio support."));
        map.put(106, new ProductUpdateInfo(79990.00, "Premium handheld gaming PC equipped with AMD Ryzen 7 7840U processor. Features a borderless 7-inch HD screen and ergonomic grips for desktop-class performance anywhere."));
        map.put(107, new ProductUpdateInfo(59990.00, "High-performance Windows 11 handheld console powered by AMD Z1 Extreme chip. Enjoy full 1080p 120Hz smooth gameplay across Game Pass, Steam, and Epic Games."));
        map.put(108, new ProductUpdateInfo(31990.00, "All-digital next-gen console offering fast load times and up to 120 FPS gameplay. Compact white design with 512GB NVMe SSD and Xbox Velocity Architecture."));
        map.put(109, new ProductUpdateInfo(52990.00, "The fastest and most powerful Xbox ever built with 12 teraflops of graphics processing power. Supports true 4K gaming, 8K HDR readiness, and 1TB custom SSD."));
        map.put(110, new ProductUpdateInfo(99990.00, "Collector luxury PlayStation 5 console featuring custom gold accents and premium housing. Includes two gold-themed DualSense wireless controllers and exclusive stand."));
        map.put(111, new ProductUpdateInfo(18990.00, "Dedicated Remote Play handheld device for streaming your PS5 games over Wi-Fi. Features an 8-inch 1080p 60fps LCD screen with full DualSense haptic feedback controls."));
        map.put(112, new ProductUpdateInfo(34990.00, "Next-gen hybrid gaming console with enhanced graphics and magnetic Joy-Con controllers. Play seamlessly in handheld mode or dock to your TV for full 4K output."));
        map.put(113, new ProductUpdateInfo(29990.00, "Hybrid console featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio. Enjoy gaming anywhere in handheld, tabletop, or TV mode."));
        map.put(114, new ProductUpdateInfo(64990.00, "Advanced handheld gaming device powered by Intel Core Ultra processor with XeSS graphics. Features ergonomic design, RGB analog sticks, and long-lasting 53Wh battery."));
        map.put(115, new ProductUpdateInfo(44990.00, "Ultra-compact and lightweight PC gaming handheld designed for comfortable portability. Outfitted with high-contrast screen, responsive hall-effect triggers, and fast cooling."));

        // Games (Category 2)
        map.put(201, new ProductUpdateInfo(3999.00, "Rebuilt from the ground up for PS5. Experience the emotional storytelling and unforgettable characters of Joel and Ellie in stunning 4K visuals with haptic feedback."));
        map.put(202, new ProductUpdateInfo(4499.00, "Embark on an epic journey across 19th-century war-torn Japan in this open-world action RPG. Master versatile combat styles with katana and firearms to shape history."));
        map.put(203, new ProductUpdateInfo(2499.00, "Experience the blockbuster open-world action in Los Santos with enhanced 4K visuals and faster loading times. Includes GTA Online with all expansion content."));
        map.put(204, new ProductUpdateInfo(3299.00, "Relive Arthur Morgan epic tale across the American heartland. Features remastered high-definition graphics, improved framerates, and the Undead Nightmare expansion."));
        map.put(205, new ProductUpdateInfo(3499.00, "Enhanced native PS5 edition featuring No Return roguelike survival mode, Lost Levels, and graphical upgrades. Follow Ellie and Abby in a gripping tale of revenge."));
        map.put(206, new ProductUpdateInfo(4499.00, "Journey across the Nine Realms with Kratos and Atreus as Asgardian forces prepare for battle. Features thrilling combat, epic boss fights, and breathtaking visuals."));
        map.put(207, new ProductUpdateInfo(3999.00, "The real driving simulator brought to life with over 400 cars and dynamic weather physics. Supports PS VR2 and immersive DualSense haptic feedback."));
        map.put(208, new ProductUpdateInfo(4499.00, "Swing through Marvel New York as both Peter Parker and Miles Morales. Battle iconic villains like Venom and Kraven using new web wings and symbiote powers."));
        map.put(209, new ProductUpdateInfo(4999.00, "Play as the legendary X-Men member Wolverine in an intense, mature action-adventure game. Features visceral Adamantium claw combat and a gripping original storyline."));
        map.put(210, new ProductUpdateInfo(4499.00, "The world game featuring unmatched realism, HyperMotionV technology, and updated rosters. Build your dream squad in Ultimate Team or manage clubs to glory."));
        map.put(211, new ProductUpdateInfo(5999.00, "Step into the state of Leonida in the most immersive Grand Theft Auto experience ever. Follow Lucia and Jason in a massive dynamic open world with groundbreaking detail."));
        map.put(212, new ProductUpdateInfo(2999.00, "Become Eivor, a legendary Viking warrior on a quest for glory. Raid Saxon fortresses, dual-wield powerful weapons, and grow your settlement in dark-age England."));
        map.put(213, new ProductUpdateInfo(2999.00, "Seek your fortune in remastered adventures featuring Nathan Drake and Chloe Frazer. Includes Uncharted 4: A Thief End and Uncharted: The Lost Legacy."));
        map.put(214, new ProductUpdateInfo(4999.00, "Hideo Kojima visionary sci-fi sequel. Reconnect a fractured world with new environments, advanced tactical gear, and a captivating star-studded narrative."));
        map.put(215, new ProductUpdateInfo(3499.00, "Entirely rebuilt from the ground up, experience the dark fantasy classic that started the genre. Master brutal melee combat with stunning ray-traced graphics."));

        // Gaming Accessories (Category 3)
        map.put(301, new ProductUpdateInfo(2490.00, "Official vertical stand designed to securely hold both PS5 Disc and Digital Edition models. Sturdy metallic base with anti-slip rubber pads for maximum stability."));
        map.put(302, new ProductUpdateInfo(16990.00, "Official 1TB NVMe expansion card for Xbox Series X|S. Delivers identical speed to the internal SSD to play games directly without sacrificing performance."));
        map.put(303, new ProductUpdateInfo(12990.00, "Officially licensed 1TB M.2 NVMe SSD for PS5 with pre-installed heatsink. Delivers up to 7300MB/s read speeds for seamless game installations and fast loading."));
        map.put(304, new ProductUpdateInfo(4990.00, "Official PlayStation 5 console covers featuring Marvel Spider-Man 2 limited edition design. Easy snap-on installation compatible with PS5 disc version."));
        map.put(305, new ProductUpdateInfo(5390.00, "Modern ergonomic wireless controller with textured grips, hybrid D-pad, and Share button. Connects seamlessly via Bluetooth to Xbox, Windows PC, Android, and iOS."));
        map.put(306, new ProductUpdateInfo(4990.00, "Dual 1080p lenses for picture-in-picture streaming during broadcast. Features background removal tools and built-in adjustable stand for monitor mounting."));
        map.put(307, new ProductUpdateInfo(6990.00, "Premium wireless controller featuring metallic gold finish and custom accent buttons. Offers adaptive triggers, haptic feedback, and built-in microphone array."));
        map.put(308, new ProductUpdateInfo(5990.00, "Full-sized wireless controller with motion controls, HD rumble, and built-in amiibo NFC functionality. Ergonomic design for extended gaming sessions."));
        map.put(309, new ProductUpdateInfo(2490.00, "Convenient media navigation remote with dedicated app launch buttons for Netflix, YouTube, and Spotify. Built-in IR transmitter to control TV power and volume."));
        map.put(310, new ProductUpdateInfo(1490.00, "High-rise thumbsticks engineered to increase precision and grip during competitive FPS games. Reduces wrist fatigue and enhances target acquisition accuracy."));
        map.put(311, new ProductUpdateInfo(8990.00, "Highly customizable accessibility controller kit designed to help players with disabilities play more comfortably. Features swappable button caps and 360 positioning."));
        map.put(312, new ProductUpdateInfo(2290.00, "Click-in charging dock capable of fast-charging up to two DualSense controllers simultaneously. Frees up USB ports on your PS5 while keeping controllers organized."));
        map.put(313, new ProductUpdateInfo(6990.00, "Pair of vibrant Neon Red and Neon Blue Joy-Con controllers for Nintendo Switch. Includes motion controls, HD rumble, and wrist straps for multiplayer gaming."));
        map.put(314, new ProductUpdateInfo(5790.00, "Innovative PS5 controller featuring immersive haptic feedback and dynamic adaptive triggers. Built-in microphone and motion sensors elevate your gaming immersion."));
        map.put(315, new ProductUpdateInfo(2190.00, "Ergonomic grip that combines two Joy-Cons into a traditional controller while charging them via USB-C during gameplay. Features charging status LED indicator."));

        // Gaming Setup (Category 4)
        map.put(401, new ProductUpdateInfo(3490.00, "Premium Banpresto collectible figure showcasing Luffy in an iconic action stance. Crafted with high-grade PVC material and vibrant anime-accurate painted details."));
        map.put(402, new ProductUpdateInfo(12990.00, "Highly detailed 1:8 scale Kotobukiya statue of the Sound Hashira Uzui Tengen. Features dynamic dual Nichirin blades, intricate uniform sculpting, and a display base."));
        map.put(403, new ProductUpdateInfo(1790.00, "12-inch scale action figure of Miles Morales with multiple points of articulation. Compatible with Titan Hero Blast Gear accessories for dynamic display setups."));
        map.put(404, new ProductUpdateInfo(1290.00, "Adorable chibi desktop collectible anime figure crafted from durable non-toxic PVC. Perfect decorative display piece for gaming desks, shelves, or computer cases."));
        map.put(405, new ProductUpdateInfo(14990.00, "Reversible L-shaped gaming desk equipped with integrated power sockets, USB charging ports, and RGB LED light strips. Features carbon fiber texture and 4-tier shelves."));
        map.put(406, new ProductUpdateInfo(15990.00, "Spacious corner computer desk featuring a full monitor stand, headphone hooks, and storage side bag. Built-in Smart LED lighting syncs with music and game audio."));
        map.put(407, new ProductUpdateInfo(7990.00, "Professional streaming microphone setup featuring dual XLR/USB connectivity, customizable RGB lighting, audio mixer, and an adjustable heavy-duty boom arm."));
        map.put(408, new ProductUpdateInfo(13990.00, "Ergonomic L-desk with built-in power strip, reversible storage shelves, and sliding drawer. Premium carbon fiber surface offers scratch-resistant and waterproof durability."));
        map.put(409, new ProductUpdateInfo(16990.00, "Heavy-duty dual-motor electric height-adjustable corner desk with memory presets. Provides smooth transition from sitting to standing for healthy long gaming sessions."));
        map.put(410, new ProductUpdateInfo(11990.00, "Stylish pink and white ergonomic racing chair with thick padded memory foam, headrest, lumbar support, and flip-up armrests. Smooth 360-degree swivel wheels."));
        map.put(411, new ProductUpdateInfo(2490.00, "Multi-functional 3-tier desktop organizer stand capable of holding up to 9 controllers and headphones. Heavy-duty weighted metal base ensures non-tip stability."));
        map.put(412, new ProductUpdateInfo(14990.00, "High-back Esports gaming chair featuring dual Bluetooth wireless speakers, retractable footrest, and 150-degree reclining backrest. Premium velvet and leather upholstery."));
        map.put(413, new ProductUpdateInfo(17990.00, "Heavy-duty gaming chair designed for big and tall gamers, supporting up to 180kg. Features breathable mesh backing, adjustable lumbar pillow, and thick padded seat."));
        map.put(414, new ProductUpdateInfo(18990.00, "Ultimate gaming throne equipped with lumbar massage function, perimeter RGB LED lights, Bluetooth speakers, and a pull-out footrest for relaxation between matches."));
        map.put(415, new ProductUpdateInfo(18990.00, "Deluxe ergonomic reclining computer chair with built-in USB-powered massage pillow, ambient RGB lighting, dual audio speakers, and high-density foam padding."));

        return map;
    }
}
