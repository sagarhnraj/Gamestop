package com.sg.gamestopbackend.config;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.repository.ProductRepository;

@Component
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
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
