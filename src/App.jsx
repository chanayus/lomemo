import "./App.css";
import "leaflet/dist/leaflet.css";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, useMapEvents } from "react-leaflet";
import { AnimatePresence, m } from "motion/react";

import { FaLocationArrow } from "react-icons/fa6";
import { IoClose, IoTrashOutline, IoSearch } from "react-icons/io5"; // เพิ่ม Icon ถังขยะ
import { GoStarFill } from "react-icons/go";
import { categories } from "./data/categories";

import L from "leaflet";
import useNotification from "./hooks/useNotification";
import Notification from "./components/ui/Notification";
import { useModal } from "./providers/ModalProvider";
import ConfirmDelete from "./components/modals/confirmDelete";

// สร้าง Custom Icon
const customIcon = new L.Icon({
  iconUrl: "/marker.png", // เปลี่ยนเป็นพาธรูปของคุณ เช่น "/my-marker.svg"
  iconSize: [38, 38], // ขนาดของ Icon [กว้าง, สูง]
  iconAnchor: [19, 38], // จุดที่วางบนพิกัด (ปกติคือ กึ่งกลางฐานล่าง: กว้าง/2, สูง)
  popupAnchor: [0, -38], // จุดที่ Popup จะเด้งออกมา (สัมพันธ์กับ iconAnchor)
});

function MapEvents({ setClickedPos, setPlaceName, setCategory, setIsSearching, addNotification }) {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setClickedPos(e.latlng);
      setCategory("");
      setPlaceName("กำลังหาชื่อสถานที่...");
      setIsSearching(true);

      map.flyTo(e.latlng, map.getZoom(), {
        animate: true,
        duration: 0.75,
      });

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`);
        const data = await res.json();

        const name = data.name || data.display_name.split(",")[0] || "ไม่พบชื่อสถานที่";
        setPlaceName(name);
      } catch (err) {
        setPlaceName("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsSearching(false);
      }
    },
    // เมื่อหาตำแหน่งเจอ
    locationfound(e) {
      console.log("Found location:", e.latlng);
      map.flyTo(e.latlng, 16, { animate: true, duration: 1.5 });

      // แถม: ปักหมุดชั่วคราวตรงจุดที่ผู้ใช้อยู่ (Optional)
      setClickedPos(e.latlng);
    },
    // เมื่อหาตำแหน่งไม่สำเร็จ (สำคัญมากเพื่อเช็คว่าทำไมไม่ทำงาน)
    locationerror(e) {
      addNotification({ desc: e.message, type: "error" });
    },
  });
  return null;
}

function App() {
  const [map, setMap] = useState(null);

  const [clickedPos, setClickedPos] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const { addNotification } = useNotification();
  const { openModal } = useModal();

  const handleSaveFavorite = () => {
    if (!placeName || !category || isSearching) {
      addNotification({ desc: "กรุณากรอกข้อมูลให้ครบถ้วน", type: "error" });
      return;
    }

    const newFavorite = {
      id: Date.now(),
      lat: clickedPos.lat,
      lng: clickedPos.lng,
      name: placeName,
      category: category,
    };

    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem("my_favorites", JSON.stringify(updatedFavorites));

    addNotification({ desc: "บันทึกข้อมูลสำเร็จ!", type: "success" });
    setClickedPos(null);
  };

  // ฟังก์ชันลบรายการโปรด
  const deleteFavorite = (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("my_favorites", JSON.stringify(updated));
  };

  const getGoogleMapsUrl = (lat, lng, name = "") => {
    // ใช้รูปแบบ q=lat,lng(ชื่อสถานที่) เพื่อให้ Google Maps แสดงชื่อบนหมุด
    const encodedName = encodeURIComponent(name);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${name ? `(${encodedName})` : ""}`;
  };

  const handleLocateMe = () => {
    if (map) {
      map.locate({
        setView: true, // ให้เลื่อนหน้าจอไปหาทันที
        maxZoom: 16, // ระดับซูมสูงสุด
        enableHighAccuracy: true, // ใช้ GPS แบบแม่นยำสูง
      });
    } else {
      console.log("Map instance not ready");
    }
  };

  const goToLocation = (lat, lng) => {
    if (map) {
      map.flyTo([lat, lng], 18, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("my_favorites") || "[]");
    setFavorites(savedFavorites);

    handleLocateMe();
  }, []);

  useEffect(() => {
    if (clickedPos) {
      setShowFavorites(false);
    }
  }, [clickedPos]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null); // เก็บรายการสถานที่ที่ API แนะนำ
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) {
        // พิมพ์อย่างน้อย 3 ตัวอักษรค่อยเริ่มหา

        setSuggestions(null);
        return;
      }

      setSearchingSuggestions(true);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=20&accept-language=th&countrycodes=th`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setSearchingSuggestions(false);
      }
    };

    // ใช้ Debounce เพื่อไม่ให้ยิง API บ่อยเกินไปขณะพิมพ์
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="flex flex-col w-full h-screen relative text-white">
      <Notification />
      <div className="w-full h-full relative z-10">
        <MapContainer ref={setMap} style={{ width: "100%", height: "100%" }} center={[13.7563, 100.5018]} zoom={13} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapEvents setClickedPos={setClickedPos} setPlaceName={setPlaceName} setCategory={setCategory} setIsSearching={setIsSearching} addNotification={addNotification} />
          {clickedPos && <Marker position={[clickedPos.lat, clickedPos.lng]} icon={customIcon}></Marker>}

          {favorites.map((fav) => (
            <Marker key={fav.id} position={[fav.lat, fav.lng]} icon={customIcon}>
              <Popup>
                <div className="text-black text-sm">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded">{fav.category}</div>
                  <div className="font-bold mt-2">{fav.name}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="fixed top-4 right-4 space-y-2 z-30">
        <button
          onClick={() => {
            setShowFavorites(true);
            setClickedPos(null);
          }}
          className="bg-black/80 backdrop-blur-md p-1.5 rounded-lg size-10 flex items-center justify-center border border-white/20 shadow-xl"
        >
          <GoStarFill size={24} color="#facc15" />
        </button>
        <button onClick={handleLocateMe} className="bg-black/80 backdrop-blur-md p-1.5 rounded-lg size-10 flex items-center justify-center border border-white/20 shadow-xl">
          <FaLocationArrow size={22} color="#fff" />
        </button>
      </div>

      {/* Search Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[70%] max-w-md">
        <div className="relative group">
          <div className="flex items-center bg-black/80 pr-3 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสถานที่..."
              className="w-full text-white py-3 px-5 focus:outline-none bg-transparent"
            />

            <AnimatePresence mode="wait">
              {searchQuery.length > 0 ? (
                <m.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={"search-icon"}
                  onClick={() => setSearchQuery("")}
                  className="p-0.5 flex items-center justify-center  bg-white/20 rounded-full size-6 "
                >
                  <IoClose size={"100%"} color="#fff" />
                </m.button>
              ) : (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={"remove-search-query"} className=" size-6 text-white">
                  <IoSearch size={"100%"} color="#fff" />
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown Suggestions */}
          <AnimatePresence>
            {(suggestions !== null || searchingSuggestions) && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 w-full mt-2 bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/25 overflow-y-auto max-h-96 "
              >
                {searchingSuggestions && <p className="text-center text-white/75 py-4">กำลังค้นหา...</p>}
                {suggestions?.length === 0 && !searchingSuggestions && <p className="text-center text-white/75 py-4">ไม่พบสถานที่</p>}
                {suggestions?.map((item, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-5 py-3 hover:bg-black/50 border-b border-white/20 last:border-none flex flex-col transition-colors"
                    onClick={() => {
                      const targetPos = [parseFloat(item.lat), parseFloat(item.lon)];
                      map.flyTo(targetPos, 17); // เลื่อนแผนที่
                      setClickedPos({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }); // เปิดฟอร์มบันทึก
                      setPlaceName(item.display_name.split(",")[0]); // ใส่ชื่อสถานที่
                      setSearchQuery(item.display_name.split(",")[0]); // อัปเดตช่องค้นหา
                      setSuggestions([]); // ล้างรายการแนะนำ
                    }}
                  >
                    <span className="font-bold text-sm line-clamp-1">{item.display_name.split(",")[0]}</span>
                    <span className="text-xs text-white/50 line-clamp-1">{item.display_name}</span>
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ส่วนแสดงรายการโปรด */}
      <m.section
        initial={{ y: "100%" }}
        animate={{ y: showFavorites ? "0%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="h-[40vh] bottom-0 space-y-4 left-0 z-40 fixed w-full overflow-y-auto p-6 bg-black/80 backdrop-blur-md border-t border-white/20 rounded-t-3xl shadow-2xl"
      >
        <hgroup className="flex items-center justify-between sticky top-0 bg-transparent pb-2">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <GoStarFill color="#facc15" /> รายการโปรด ({favorites.length})
          </h2>
          <button onClick={() => setShowFavorites(false)} className="size-8 bg-white/10 rounded-full flex items-center justify-center">
            <IoClose size={20} />
          </button>
        </hgroup>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {favorites.length === 0 && <p className="text-gray-400 py-10 text-center col-span-full">ยังไม่มีรายการโปรด</p>}
          {favorites.map((fav) => (
            <div
              onClick={() => goToLocation(fav.lat, fav.lng)}
              key={fav.id}
              className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-blue-600/80 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{fav.category}</span>
                </div>
                <h4 className="font-bold text-base line-clamp-1 text-white">{fav.name}</h4>
                <p className="text-gray-400 text-[10px]">
                  {fav.lat.toFixed(5)}, {fav.lng.toFixed(5)}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <a
                  href={getGoogleMapsUrl(fav.lat, fav.lng, fav.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white flex items-center justify-center size-9 rounded-lg transition-transform active:scale-90"
                >
                  <img src="/google-map.svg" alt="GMap" className="size-5" />
                </a>
                <button
                  onClick={() => openModal(<ConfirmDelete onConfirm={() => deleteFavorite(fav.id)} />)}
                  className="bg-red-500/20 text-red-500 flex items-center justify-center size-9 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </m.section>

      {/* ส่วนบันทึกสถานที่ใหม่ */}
      <m.section
        initial={{ y: "100%" }}
        animate={{ y: clickedPos ? "0%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="h-fit bottom-0 space-y-4 left-0 z-40 fixed w-full p-6 pb-12 bg-black/80 backdrop-blur-md border-t border-white/20 rounded-t-3xl shadow-2xl"
      >
        <div className="max-w-md mx-auto">
          <hgroup className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">ปักหมุดตำแหน่งใหม่</h2>
            <button onClick={() => setClickedPos(null)} className="size-8 bg-white/10 rounded-full flex items-center justify-center">
              <IoClose size={20} />
            </button>
          </hgroup>

          <div className="flex flex-col gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold">ชื่อสถานที่</label>
              <input
                type="text"
                placeholder={isSearching ? "กำลังดึงข้อมูล..." : "กรอกชื่อสถานที่"}
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                disabled={isSearching}
                className="w-full border border-white/20 px-3 h-11 text-sm rounded-xl bg-white/5 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold">หมวดหมู่</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-white/20 px-3 py-2.5 h-11 rounded-xl bg-white/5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-gray-800">
                  -- เลือกหมวดหมู่ --
                </option>

                {categories?.map((cat) => (
                  <option key={"cat-" + cat} value={cat} className="bg-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={handleSaveFavorite} disabled={isSearching} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors disabled:opacity-50">
                {isSearching ? "โปรดรอ..." : "บันทึกลงรายการโปรด"}
              </button>
              <a
                href={getGoogleMapsUrl(clickedPos?.lat, clickedPos?.lng, placeName)}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-black px-4 py-3 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-lg"
              >
                <img src="/google-map.svg" alt="" className="size-6" />
              </a>
            </div>
          </div>
        </div>
      </m.section>
    </div>
  );
}

export default App;
