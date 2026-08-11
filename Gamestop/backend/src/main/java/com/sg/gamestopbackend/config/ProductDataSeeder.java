package com.sg.gamestopbackend.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
        try {
            seedCategories();
            seedProductsAndImages();
            applyProductUpdates();
        } catch (Exception e) {
            System.err.println("ProductDataSeeder warning: " + e.getMessage());
        }
    }

    private void seedCategories() {
        String[] catNames = {"Gaming Consoles", "Games", "Gaming Accessories", "Gaming Setup"};
        for (String catName : catNames) {
            try {
                boolean exists = categoryRepository.findAll().stream()
                        .anyMatch(c -> (c.getName() != null && c.getName().equalsIgnoreCase(catName))
                                || (c.getCategoryName() != null && c.getCategoryName().equalsIgnoreCase(catName)));
                if (!exists) {
                    Category cat = new Category(null, catName);
                    categoryRepository.save(cat);
                }
            } catch (Exception e) {
                System.err.println("ProductDataSeeder category warning (" + catName + "): " + e.getMessage());
            }
        }
    }

    private void seedProductsAndImages() {
        try {
            if (productRepository.count() == 0) {
                List<Category> allCategories = categoryRepository.findAll();
                if (allCategories.isEmpty()) return;

                Category defaultCat = allCategories.get(0);
                Map<Integer, Category> catMap = new HashMap<>();
                for (Category c : allCategories) {
                    String name = c.getName() != null ? c.getName() : c.getCategoryName();
                    if (name != null) {
                        if (name.toLowerCase().contains("console")) catMap.put(1, c);
                        else if (name.equalsIgnoreCase("games") || name.toLowerCase().contains("game")) catMap.put(2, c);
                        else if (name.toLowerCase().contains("accessor")) catMap.put(3, c);
                        else if (name.toLowerCase().contains("setup")) catMap.put(4, c);
                    }
                }

                List<ProductSeedInfo> seeds = getProductSeeds();
                LocalDateTime now = LocalDateTime.now();
                for (ProductSeedInfo seed : seeds) {
                    try {
                        Category cat = catMap.getOrDefault(seed.categoryId, defaultCat);
                        Product p = new Product();
                        p.setName(seed.name);
                        p.setDescription(seed.description);
                        p.setPrice(BigDecimal.valueOf(seed.price));
                        p.setStock(10);
                        p.setCategory(cat);
                        p.setCreatedAt(now);
                        p.setUpdatedAt(now);
                        Product savedProduct = productRepository.save(p);

                        if (seed.imageUrl != null && !seed.imageUrl.isEmpty()) {
                            ProductImage img = new ProductImage();
                            img.setProduct(savedProduct);
                            img.setImageUrl(seed.imageUrl);
                            productImageRepository.save(img);
                        }
                    } catch (Exception e) {
                        System.err.println("ProductDataSeeder product warning (" + seed.name + "): " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("ProductDataSeeder seedProductsAndImages warning: " + e.getMessage());
        }
    }

    private void applyProductUpdates() {
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

    private static class ProductSeedInfo {
        String name;
        String description;
        double price;
        int categoryId;
        String imageUrl;

        ProductSeedInfo(String name, String description, double price, int categoryId, String imageUrl) {
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
            new ProductSeedInfo("Xbox VR", "Next-generation immersive virtual reality headset designed for Xbox.", 39990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/Xbox%20VR.webp?updatedAt=1785152019525"),
            new ProductSeedInfo("PS5 Pro", "Experience ultra-high definition gaming with enhanced GPU performance.", 69990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20pro.webp?updatedAt=1785152019514"),
            new ProductSeedInfo("Steam Deck", "Powerful portable PC gaming handheld powered by a custom AMD APU.", 49990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/steam%20deck.jpg?updatedAt=1785152019425"),
            new ProductSeedInfo("PS5 Spidey Edition", "Limited edition Marvel Spider-Man 2 PlayStation 5 console bundle.", 59990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Spidey%20edition.jpg?updatedAt=1785152019417"),
            new ProductSeedInfo("PS5 Slim", "Sleek and compact design delivering the full power of PlayStation 5.", 44990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Slim.webp?updatedAt=1785152019515"),
            new ProductSeedInfo("AYA NEO 2S", "Premium handheld gaming PC equipped with AMD Ryzen 7 7840U processor.", 79990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%202S.jpg?updatedAt=1785152019431"),
            new ProductSeedInfo("ROG Ally", "High-performance Windows 11 handheld console powered by AMD Z1 Extreme chip.", 59990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/rog%20ally.jpg?updatedAt=1785152019404"),
            new ProductSeedInfo("Xbox Series S", "All-digital next-gen console offering fast load times and up to 120 FPS gameplay.", 31990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/xbox%20series%20S.webp?updatedAt=1785152019482"),
            new ProductSeedInfo("Xbox", "The fastest and most powerful Xbox ever built with 12 teraflops.", 52990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/xbox.webp?updatedAt=1785152019417"),
            new ProductSeedInfo("PS5 Gold Edition", "Collector luxury PlayStation 5 console featuring custom gold accents.", 99990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Gold%20Edition.jpg?updatedAt=1785152019181"),
            new ProductSeedInfo("PS Portal", "Dedicated Remote Play handheld device for streaming your PS5 games over Wi-Fi.", 18990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/PS%20portal.jpg?updatedAt=1785152019169"),
            new ProductSeedInfo("Nintendo Switch 2", "Next-gen hybrid gaming console with enhanced graphics and magnetic Joy-Cons.", 34990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%202.jpg?updatedAt=1785152019003"),
            new ProductSeedInfo("Nintendo Switch 1", "Hybrid console featuring a vibrant 7-inch OLED screen, wide adjustable stand.", 29990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%201.png?updatedAt=1785152018953"),
            new ProductSeedInfo("MSI Claw", "Advanced handheld gaming device powered by Intel Core Ultra processor.", 64990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/MSI%20claw.jpg?updatedAt=1785152018875"),
            new ProductSeedInfo("AYA NEO Air Plus", "Ultra-compact and lightweight PC gaming handheld designed for comfortable portability.", 44990.00, 1, "https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%20Air%20plus.jpg?updatedAt=1785152018827"),

            // Games (Category 2)
            new ProductSeedInfo("SONY The Last Of Us Part 1 For PS5", "Rebuilt from the ground up for PS5. Experience emotional storytelling.", 3999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20Of%20Us%20Part%201%20For%20PS5%20(Action-Adventure%20Game,%2050668583,%20Standard%20Edition).webp?updatedAt=1785148697115"),
            new ProductSeedInfo("Sony PS5 Rise Of The Ronin", "Embark on an epic journey across 19th-century war-torn Japan.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Rise%20Of%20The%20Ronin.webp?updatedAt=1785148697040"),
            new ProductSeedInfo("Sony PS5 Grand Theft Auto V", "Experience the blockbuster open-world action in Los Santos.", 2499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Grand%20Theft%20Auto%20V%20|%20Rockstar%20Games%20|%20GTA%20V.webp?updatedAt=1785148697002"),
            new ProductSeedInfo("Sony PS5 Red Dead Redemption", "Relive Arthur Morgan epic tale across the American heartland.", 3299.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Red%20Dead%20Redemption.webp?updatedAt=1785148696984"),
            new ProductSeedInfo("SONY The Last of Us Part 2 Remastered For PS5", "Enhanced native PS5 edition featuring No Return roguelike mode.", 3499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20of%20Us%20Part%202%20Remastered%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-15508).webp?updatedAt=1785148697000"),
            new ProductSeedInfo("SONY God Of War Ragnarok For PS5", "Journey across the Nine Realms with Kratos and Atreus.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20God%20Of%20War%20Ragnarok%20For%20PS5%20(Action%20Games,%20Standard%20Edition,%2050668668).webp?updatedAt=1785148696950"),
            new ProductSeedInfo("Sony PS5 Gran Turismo 7 Standard Edition", "The real driving simulator brought to life with over 400 cars.", 3999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Gran%20Turismo%207%20Standard%20Edition.webp?updatedAt=1785148696990"),
            new ProductSeedInfo("SONY Spiderman 2 For PS5", "Swing through Marvel New York as both Peter Parker and Miles Morales.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20Spiderman%202%20For%20PS5%20(Action-Adventure%20Games,%20Standard%20Edition,%2050668584).webp?updatedAt=1785148696924"),
            new ProductSeedInfo("Sony PS5 Marvel's Wolverine", "Play as the legendary X-Men member Wolverine in an intense action game.", 4999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Marvel's%20Wolverine.webp?updatedAt=1785148696854"),
            new ProductSeedInfo("Sony PS5 EA SPORTS FC 26 Standard Edition", "The world game featuring unmatched realism, HyperMotionV technology.", 4499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20EA%20SPORTS%20FC%2026%20Standard%20Edition.webp?updatedAt=1785148696995"),
            new ProductSeedInfo("PS5 Grand Theft Auto VI", "Step into the state of Leonida in the most immersive GTA experience.", 5999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/PS5%C2%AE%20Grand%20Theft%20Auto%20VI%20|%20Rockstar%20Games%20|%20GTA%206%20Standard%20Edition.webp?updatedAt=1785148696820"),
            new ProductSeedInfo("Sony PS5 Assassin's Creed Valhalla", "Become Eivor, a legendary Viking warrior on a quest for glory.", 2999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Assassin's%20Creed%20Valhalla.webp?updatedAt=1785148696812"),
            new ProductSeedInfo("Sony PS5 Uncharted Legacy of Thieves Collection", "Seek your fortune in remastered adventures featuring Nathan Drake.", 2999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Uncharted%20Legacy%20of%20Thieves%20Collection.webp?updatedAt=1785148696868"),
            new ProductSeedInfo("SONY Death Stranding 2 On The Beach For PS5", "Hideo Kojima visionary sci-fi sequel. Reconnect a fractured world.", 4999.00, 2, "https://ik.imagekit.io/stringstackSG/Games/SONY%20Death%20Stranding%202%20On%20The%20Beach%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-02015).webp?updatedAt=1785148696855"),
            new ProductSeedInfo("Sony PS5 Demon Souls", "Entirely rebuilt from the ground up, experience the dark fantasy classic.", 3499.00, 2, "https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%20Demon%20Souls.webp?updatedAt=1785148696798"),

            // Accessories (Category 3)
            new ProductSeedInfo("PS5 Vertical Stand", "Official vertical stand designed to securely hold both PS5 Disc and Digital.", 2490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PS5%20Vertical%20Stand.jpg?updatedAt=1785152753606"),
            new ProductSeedInfo("Seagate Storage Expansion Card", "Official 1TB NVMe expansion card for Xbox Series X|S.", 16990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Seagate%20Storage%20Expansion%20Card.jpg?updatedAt=1785152753596"),
            new ProductSeedInfo("WD Black SN850P SSD (PS5)", "Officially licensed 1TB M.2 NVMe SSD for PS5 with pre-installed heatsink.", 12990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/WD%20Black%20SN850P%20SSD%20(PS5).jpg?updatedAt=1785152753614"),
            new ProductSeedInfo("PS5 Spidey Edition Covers", "Official PlayStation 5 console covers featuring Marvel Spider-Man 2 design.", 4990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20spidey%20edition.jpg?updatedAt=1785152753545"),
            new ProductSeedInfo("Xbox Wireless Controller", "Modern ergonomic wireless controller with textured grips and Share button.", 5390.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Xbox%20Wireless%20Controller.avif?updatedAt=1785152753631"),
            new ProductSeedInfo("HD Camera for PS5", "Dual 1080p lenses for picture-in-picture streaming during broadcast.", 4990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/HD%20Camera%20for%20PS5.webp?updatedAt=1785152753604"),
            new ProductSeedInfo("PS5 Gold Edition Controller", "Premium wireless controller featuring metallic gold finish.", 6990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20gold%20edition.webp?updatedAt=1785152753480"),
            new ProductSeedInfo("Nintendo Switch Pro Controller", "Full-sized wireless controller with motion controls, HD rumble.", 5990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Nintendo%20Switch%20Pro%20Controller.avif?updatedAt=1785152753551"),
            new ProductSeedInfo("PlayStation Media Remote", "Convenient media navigation remote with dedicated app launch buttons.", 2490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Media%20Remote.webp?updatedAt=1785152753422"),
            new ProductSeedInfo("KontrolFreek Performance Thumbsticks", "High-rise thumbsticks engineered to increase precision and grip.", 1490.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/KontrolFreek%20Performance%20Thumbsticks.jpg?updatedAt=1785152753292"),
            new ProductSeedInfo("PlayStation Access Controller", "Highly customizable accessibility controller kit.", 8990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Access%20Controller.jpg?updatedAt=1785152753119"),
            new ProductSeedInfo("DualSense Charging Station", "Click-in charging dock capable of fast-charging up to two controllers.", 2290.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Charging%20Station.avif?updatedAt=1785152753304"),
            new ProductSeedInfo("Joy-Con Controllers (Neon)", "Pair of vibrant Neon Red and Neon Blue Joy-Con controllers.", 6990.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/joy-Con%20Controllers%20(Neon).webp?updatedAt=1785152753258"),
            new ProductSeedInfo("DualSense Wireless Controller", "Innovative PS5 controller featuring haptic feedback and adaptive triggers.", 5790.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Wireless%20Controller.webp?updatedAt=1785152753227"),
            new ProductSeedInfo("Joy-Con Charging Grip", "Ergonomic grip that combines two Joy-Cons into a traditional controller.", 2190.00, 3, "https://ik.imagekit.io/stringstackSG/Console%20Accessories/Joy-Con%20Charging%20Grip.jpg?updatedAt=1785152753070"),

            // Setup (Category 4)
            new ProductSeedInfo("One Piece Luffy Figure", "Premium Banpresto collectible figure showcasing Luffy in an iconic stance.", 3490.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/One%20Piece%20King%20of%20Artist%20The%20Monkey.%20D.%20Luffy%20One%20Piece%20Monkey%20D.%20Luffy%20King%20of%20Artist%20Figure%20Prize%20Banpresto.jpg?updatedAt=1785177280405"),
            new ProductSeedInfo("ARTFX J Uzui Tengen Figure", "Highly detailed 1:8 scale Kotobukiya statue of Uzui Tengen.", 12990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/ARTFX%20J%20Demon%20Slayer%20Uzui%20Tengen%201:8%20Scale%20PVC%20Pre-Painted%20Complete%20Figure%20PV041.jpg?updatedAt=1785177280339"),
            new ProductSeedInfo("Marvel Spider-Man Miles Morales Figure", "12-inch scale action figure of Miles Morales with multiple points of articulation.", 1790.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Marvel%20Spider-Man%20Titan%20Hero%20Series%20Ultimate%20Spiderman(Miles%20Morales)%20Figure.jpg?updatedAt=1785177280094"),
            new ProductSeedInfo("Anime Figures Cute Collectable Model", "Adorable chibi desktop collectible anime figure crafted from durable PVC.", 1290.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Anime%20Figures%20Cartoon%20Character%20Cute%20Model%20Collectable%20Figure%20Birthday%20Creative%20Gift.jpg?updatedAt=1785177279863"),
            new ProductSeedInfo("Bestier L Shaped Gaming Desk", "Reversible L-shaped gaming desk equipped with power sockets and LED.", 14990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Bestier%2051%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets,%20LED%20Workstation%20with%204%20Tiers%20Shelves,%20Carbon%20Fiber%20White.png?updatedAt=1785176703281"),
            new ProductSeedInfo("Eivanet 53inch L Shaped Gaming Desk", "Spacious corner computer desk featuring monitor stand and LED lights.", 15990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%2053inch%20L%20Shaped%20Desk,L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets%20&%20LED%20Lights,%20Computer%20Desk%20with%20Monitor%20Stand%20&%20Storage%20Bag,%20Home%20Office%20Desk%20Corner%20Desk%20with%20Hooks,Carbon%20Fiber%20Black.jpg?updatedAt=1785176701840"),
            new ProductSeedInfo("FIFINE Dynamic Mic Bundle", "Professional streaming microphone setup with dual XLR/USB connectivity.", 7990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/FIFINE%20Gaming%20Dynamic%20Mic%20Bundle-%20XLR:USB%20Mic%20Kit%20with%20RGB%20Boom%20Arm,3%20EQ%20Audio%20Mixer%20with%20Voice%20Changer%20and%2010ft%20XLR%20Cable%20for%20Streaming:Podcast:Game%20Voice%20(AM8PROT+SC8+L9).jpg?updatedAt=1785176701750"),
            new ProductSeedInfo("Eivanet Reversible Gaming Desk", "Ergonomic L-desk with built-in power strip and reversible storage.", 13990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlet%20&%20Led%20Light,%2047%20inch%20Reversible%20Computer%20Desk%20with%20Shelves,%20Hooks,%20and%20Drawer,%20Cornor%20Home%20Office%20Desk%20Table%20for%20Living%20Room,%20Bedroom,%20Black%20.jpg?updatedAt=1785176701790"),
            new ProductSeedInfo("Standing Height Adjustable Gaming Desk", "Heavy-duty dual-motor electric height-adjustable corner desk.", 16990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/L-Shaped%20Gaming%20Desk,%20Large%20Standing%20Desk,%20Study%20&%20Office%20Table,%20Sturdy%20Legs%20and%20Smooth%20Edges,%20Corner%20Computer%20Desk%20with%20Storage%20Shelves%20-%20Perfect%20for%20Bedroom%20and%20Office,%20Black%20Left,%2047.2%20x.jpg?updatedAt=1785176701732"),
            new ProductSeedInfo("Pink Ergonomic Racing Gaming Chair", "Stylish pink and white ergonomic racing chair with memory foam.", 11990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Gaming%20Chair%20Racing%20Ergonomic%20Racing%20Chair%20High%20Back%20PC%20Computer%20Gaming%20Chairs%20with%20Headrest%20Lumbar%20Support%20&%20Flip-up%20Arms%20PU%20Leather%20Adjustable%20Height%20Swivel,%20Pink.jpg?updatedAt=1785176701763"),
            new ProductSeedInfo("Kosker Headset & Controller Stand", "Multi-functional 3-tier desktop organizer stand.", 2490.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Kosker%20Headset%20Stand%203%20Tiers%20for%20Desk,%20Rotatable%20Gaming%20Controller%20Stand%20for%20PS5:PS4:Xbox:Switch2:PS%20Portal:Phone,%20Universal%20PC%20Gamer%20Gift%20Accessory%20Controller:Headphone%20Holder%20for%209%20Packs%20Controller.jpg?updatedAt=1785176701662"),
            new ProductSeedInfo("GTPLAYER Gaming Chair with Speakers", "High-back Esports gaming chair featuring dual Bluetooth wireless speakers.", 14990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Gaming%20Chair%20with%20Speakers,%20Video%20Game%20Chairs%20with%20Footrest,%20PC%20Gamer%20Chairs%20for%20Adults%20-%20Padded%20High%20Back%20Ergonomic%20Reclining%20Silla%20Gamer,%20Linkage%20Armrest,%20Ace%20Pro,%20Blue%20(Velvet).jpg?updatedAt=1785176701597"),
            new ProductSeedInfo("GTPLAYER Big and Tall Gaming Chair", "Heavy-duty gaming chair designed for big and tall gamers.", 17990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Big%20and%20Tall%20Gaming%20Chair%20Ergonomic%20Heavy%20Duty%20Office%20Chair%20Racing%20Seat%20with%20Adjustable%20Lumbar%20Pillow%20Footrest%20150%20Reclining%20Thickened%20Armrests%20Breathable%20Mesh%20for%20Esports:PC%20Gaming%20.jpg?updatedAt=1785176701605"),
            new ProductSeedInfo("Massage Gaming Chair with LED Light", "Ultimate gaming throne equipped with lumbar massage function and RGB.", 18990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445"),
            new ProductSeedInfo("Deluxe Massage Gaming Chair RGB", "Deluxe ergonomic reclining computer chair with massage pillow.", 18990.00, 4, "https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445")
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

        return map;
    }
}
