"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { loadCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, PUBLIC_IMAGES, type CmsTour, type CmsVenue } from "@/lib/cms-data";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import styles from "./detail-pages.module.css";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + "đ";

function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className={styles.breadcrumb} aria-label="Đường dẫn">{items.map((item, index) => <span key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}{index < items.length - 1 && <b aria-hidden="true">›</b>}</span>)}</nav>;
}

function BookingNotice({ message }: { message: string }) {
  if (!message) return null;
  return <p className={styles.notice} role="status">{message}</p>;
}

export function TourDetailPage({ slug }: { slug: string }) {
  const found = CMS_SEEDS.tours.find((item) => item.slug === slug);
  const initial = found ?? CMS_SEEDS.tours[4];
  const [loading, setLoading] = useState(!found);
  const [tour, setTour] = useState<CmsTour>(initial);
  const [related, setRelated] = useState<CmsTour[]>(CMS_SEEDS.tours.filter((item) => item.id !== initial.id).slice(0, 3));
  const [photo, setPhoto] = useState(0);
  const [notice, setNotice] = useState("");
  const gallery = tour.gallery.length ? tour.gallery : [tour.image];

  useEffect(() => {
    loadCmsRecords("tours").then((items) => {
      const record = items.find((item) => item.slug === slug && item.state === "published");
      if (record) setTour(record);
      setRelated(items.filter((item) => item.id !== record?.id && item.state === "published").slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Biểu mẫu hợp lệ. Hệ thống đặt dịch vụ chưa kết nối PMS/CRM nên yêu cầu chưa được gửi; vui lòng liên hệ Nghieng Travel để xác nhận.");
  };

  if (loading) return <main className={styles.site}><SiteHeader /><p role="status" style={{ display: "grid", minHeight: "45vh", placeItems: "center", color: "var(--public-muted)" }}>Đang tải hành trình…</p><SiteFooter /></main>;

  return (
    <main className={styles.site}>
      <SiteHeader />
      <section className={styles.tourHero} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.97) 0%, rgba(3,23,43,.72) 47%, rgba(3,23,43,.12) 100%), url(" + tour.image + ")" }}>
        <div className={styles.heroInner}>
          <Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Tour", href: "/tour" }, { label: "Tour Văn Hóa Vùng Miền", href: "/tour/van-hoa-vung-mien" }, { label: tour.title }]} />
          <span className={styles.eyebrow}>NGHIENG TRAVEL</span>
          <h1>{tour.title}</h1>
          <p>{tour.description}</p>
          <a className={styles.goldButton} href="#booking">Đặt tour ngay <span aria-hidden="true">→</span></a>
          <div className={styles.heroControls}><button type="button" aria-label="Ảnh trước" onClick={() => setPhoto((photo + gallery.length - 1) % gallery.length)}>←</button><span>{photo + 1} / {gallery.length}</span><button type="button" aria-label="Ảnh tiếp theo" onClick={() => setPhoto((photo + 1) % gallery.length)}>→</button></div>
        </div>
      </section>
      <div className={styles.detailLayout}>
        <div className={styles.mainColumn}>
          <section className={styles.contentBlock}>
            <div className={styles.sectionTitle}><span></span><h2>Khám phá các điểm đến nổi bật</h2></div>
            <div className={styles.galleryLayout}>
              <img className={styles.galleryMain} src={gallery[photo % gallery.length]} alt={tour.title + " – điểm đến"} />
              <div className={styles.galleryStack}>{gallery.slice(1, 4).map((image, index) => <button type="button" key={image + index} onClick={() => setPhoto((index + 1) % gallery.length)} aria-label={"Xem ảnh " + (index + 2)}><img src={image} alt="" />{index === 2 && gallery.length > 4 && <span>+{gallery.length - 4} ảnh</span>}</button>)}</div>
            </div>
            <div className={styles.tourFacts}><div><b>⌖</b><span>Điểm đến<strong>{tour.location}</strong></span></div><div><b>▦</b><span>Thời gian<strong>{tour.duration}</strong></span></div><div><b>♧</b><span>Loại hình<strong>Tour văn hóa</strong></span></div><div><b>★</b><span>Đánh giá<strong>{tour.rating.toFixed(1)}/5 ({tour.reviewCount} đánh giá)</strong></span></div></div>
          </section>

          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Giới thiệu tour</h2></div><p className={styles.bodyCopy}>{tour.description}</p></section>

          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Điểm nổi bật</h2></div><div className={styles.highlights}>{tour.highlights.map((item, index) => <div key={item}><b>{["⌖", "◇", "▦", "✦"][index % 4]}</b><span>{item}</span></div>)}</div></section>

          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Lịch trình chi tiết</h2></div><div className={styles.itinerary}>{tour.itinerary.map((day) => <article key={day.day}><b className={styles.dayNumber}>{day.day}</b><div><h3>Ngày {day.day}: {day.title}</h3><ul>{day.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul></div></article>)}</div></section>

          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Hình ảnh hành trình</h2></div><div className={styles.journeyGallery}>{gallery.slice(0, 4).map((image, index) => <button type="button" key={image + index} onClick={() => setPhoto(index)} aria-label={"Chọn ảnh hành trình " + (index + 1)}><img src={image} alt={tour.title + " " + (index + 1)} /></button>)}</div></section>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.bookingPanel} id="booking"><h2>ĐẶT TOUR NGAY</h2><p>Trải nghiệm hành trình văn hóa, lịch sử trọn vẹn.</p>
            <form onSubmit={submit}>
              <label>Họ và tên<input name="name" autoComplete="name" required placeholder="Nguyễn Văn An" /></label>
              <label>Email<input name="email" type="email" autoComplete="email" required placeholder="email@example.com" /></label>
              <label>Ngày khởi hành<input name="departure" type="date" defaultValue={tour.departureDate} required /></label>
              <div className={styles.formRow}><label>Người lớn<input name="adults" type="number" min="1" defaultValue="2" required /></label><label>Trẻ em<input name="children" type="number" min="0" defaultValue="0" /></label></div>
              <label>Khách sạn<select name="hotel" defaultValue=""><option value="">Chọn khách sạn</option>{tour.hotelOptions.map((hotel) => <option key={hotel}>{hotel}</option>)}</select></label>
              <label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" required placeholder="Nhập số điện thoại" /></label>
              <button className={styles.submitButton} type="submit">Đặt tour ngay <span aria-hidden="true">→</span></button>
              <BookingNotice message={notice} />
            </form>
          </section>
          <section className={styles.pricePanel} id="price"><span>GIÁ TOUR</span><strong>{money(tour.priceFrom)}<small>/khách</small></strong><p>Áp dụng cho đoàn từ 2 khách.</p><a href="#booking">Xem chi tiết giá <span aria-hidden="true">→</span></a></section>
          <section className={styles.relatedPanel}><h2>TOUR LIÊN QUAN</h2>{related.map((item) => <Link className={styles.relatedItem} href={"/tour/" + item.slug} key={item.id}><img src={item.image} alt="" /><span><b>{item.title}</b><small>{item.duration} · {item.location}</small><strong>{money(item.priceFrom)}</strong></span><i aria-hidden="true">→</i></Link>)}</section>
        </aside>
      </div>
      <section className={styles.detailBanner} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.8), rgba(3,23,43,.42)), url(" + PUBLIC_IMAGES[2] + ")" }}><div><span>NGHIENG TRAVEL</span><h2>TRẢI NGHIỆM VĂN HÓA – KHÁM PHÁ VIỆT NAM</h2><p>Từ những làng nghề truyền thống, di tích lịch sử đến lễ hội đặc sắc, cùng tạo nên hành trình giàu cảm xúc.</p></div><Link className={styles.goldButton} href="/tour">Khám phá các tour khác <span aria-hidden="true">→</span></Link></section>
      <SiteFooter />
    </main>
  );
}

export function VenueDetailPage({ slug, kind }: { slug: string; kind?: CmsVenue["kind"] }) {
  const found = CMS_SEEDS.venues.find((item) => item.slug === slug && (!kind || item.kind === kind));
  const initial = found ?? CMS_SEEDS.venues[9];
  const [loading, setLoading] = useState(!found);
  const [venue, setVenue] = useState<CmsVenue>(initial);
  const [photo, setPhoto] = useState(0);
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState(0);
  const gallery = venue.gallery.length ? venue.gallery : [venue.image];
  const isHotel = venue.kind !== "restaurant";

  useEffect(() => {
    loadCmsRecords("venues").then((items) => {
      const record = items.find((item) => item.slug === slug && item.state === "published" && (!kind || item.kind === kind));
      if (record) setVenue(record);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [kind, slug]);

  const reviews = [
    { name: "Nguyễn Thị Hương", text: "Kỳ nghỉ thật tuyệt vời! Phòng ốc sạch sẽ, nhân viên thân thiện, đồ ăn ngon và đặc biệt là view biển cực đẹp. Chắc chắn sẽ quay lại!" },
    { name: "Minh Anh", text: "Không gian đẹp, đội ngũ chu đáo và trải nghiệm rất dễ chịu. Một điểm đến đáng nhớ cùng gia đình." },
    { name: "Hoàng Nam", text: "Dịch vụ chuyên nghiệp, vị trí thuận tiện và nhiều lựa chọn ẩm thực địa phương." },
  ];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Biểu mẫu hợp lệ. Hệ thống chưa kết nối PMS/CRM nên yêu cầu chưa được gửi; vui lòng liên hệ trực tiếp để xác nhận dịch vụ.");
  };

  if (loading) return <main className={styles.site}><SiteHeader /><p role="status" style={{ display: "grid", minHeight: "45vh", placeItems: "center", color: "var(--public-muted)" }}>Đang tải địa điểm…</p><SiteFooter /></main>;

  return (
    <main className={styles.site}>
      <SiteHeader />
      <section className={styles.venueHero} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.96) 0%, rgba(3,23,43,.72) 48%, rgba(3,23,43,.16) 100%), url(" + venue.image + ")" }}>
        <div className={styles.heroInner}><Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Nhà Hàng – Khách Sạn", href: "/nha-hang-khach-san" }, { label: venue.kind === "restaurant" ? "Nhà hàng" : "Khách sạn", href: venue.kind === "restaurant" ? "/nha-hang" : "/khach-san" }, { label: venue.title }]} /><span className={styles.eyebrow}>{venue.kind.toLocaleUpperCase("vi-VN")}</span><h1>{venue.title}</h1><div className={styles.ratingLine}><span>{venue.location}</span><b>★★★★★</b><strong>{venue.rating.toFixed(1)} ({venue.reviewCount} đánh giá)</strong></div><p>{venue.summary}</p><a className={styles.goldButton} href="#booking">{isHotel ? "Đặt phòng ngay" : "Đặt bàn ngay"} <span aria-hidden="true">→</span></a><div className={styles.heroControls}><button type="button" aria-label="Ảnh trước" onClick={() => setPhoto((photo + gallery.length - 1) % gallery.length)}>←</button><span>{photo + 1} / {gallery.length}</span><button type="button" aria-label="Ảnh tiếp theo" onClick={() => setPhoto((photo + 1) % gallery.length)}>→</button></div></div>
      </section>

      <div className={styles.detailLayout}>
        <div className={styles.mainColumn}>
          <section className={styles.contentBlock}><div className={styles.venueGallery}><button type="button" className={styles.venueGalleryMain} onClick={() => setPhoto((photo + 1) % gallery.length)}><img src={gallery[photo % gallery.length]} alt={venue.title} /><span aria-hidden="true">›</span></button><div className={styles.thumbnails}>{gallery.slice(0, 5).map((image, index) => <button type="button" className={photo === index ? styles.thumbnailActive : ""} onClick={() => setPhoto(index)} key={image + index} aria-label={"Chọn ảnh " + (index + 1)}><img src={image} alt="" /></button>)}</div></div></section>
          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Thông tin chi tiết</h2></div>{venue.description.split("\n\n").map((paragraph) => <p className={styles.bodyCopy} key={paragraph}>{paragraph}</p>)}<figure className={styles.quoteImage} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.72), rgba(3,23,43,.1)), url(" + gallery[0] + ")" }}><blockquote>“{venue.quote}”</blockquote></figure></section>
          <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Tiện nghi nổi bật</h2></div><div className={styles.amenityGrid}>{venue.amenities.slice(0, 6).map((item, index) => <div key={item}><b>{["⌂", "◉", "♧", "✦", "↗", "◷"][index % 6]}</b><span>{item}</span></div>)}</div></section>
          {venue.rooms.length > 0 && <section className={styles.contentBlock}><div className={styles.sectionTitle}><span></span><h2>Các loại phòng</h2><Link href="#booking">Xem tất cả →</Link></div><div className={styles.roomGrid}>{venue.rooms.map((room) => <article className={styles.roomCard} key={room.name}><img src={room.image} alt={room.name} /><div><h3>{room.name}</h3><p>{room.capacity}</p><small>{room.amenities.join(" · ")}</small><strong>{money(room.price)} <small>/ đêm</small></strong><a href="#booking">Xem chi tiết <span aria-hidden="true">→</span></a></div></article>)}</div></section>}
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.bookingPanel} id="booking"><h2>{isHotel ? "ĐẶT PHÒNG NGAY" : "ĐẶT BÀN NGAY"}</h2><p>Để lại thông tin, Nghieng Travel sẽ hỗ trợ bạn.</p><form onSubmit={submit}>
            <div className={styles.formRow}><label>{isHotel ? "Ngày nhận phòng" : "Ngày sử dụng"}<input type="date" required /></label>{isHotel && <label>Ngày trả phòng<input type="date" required /></label>}</div>
            <label>Số khách<select defaultValue="2 người lớn, 0 trẻ em"><option>1 người lớn</option><option>2 người lớn, 0 trẻ em</option><option>2 người lớn, 1 trẻ em</option><option>4 người lớn</option></select></label>
            <label>Họ và tên<input required placeholder="Nguyễn Văn An" /></label><label>Email<input type="email" required placeholder="email@example.com" /></label><label>Số điện thoại<input type="tel" required placeholder="Nhập số điện thoại" /></label>
            <button className={styles.submitButton} type="submit">{isHotel ? "Kiểm tra phòng trống" : "Gửi yêu cầu đặt bàn"} <span aria-hidden="true">→</span></button><BookingNotice message={notice} />
          </form></section>
          <section className={styles.amenityPanel}><h2>TIỆN ÍCH NHANH</h2><div>{venue.amenities.slice(0, 6).map((item) => <span key={item}>◇ {item}</span>)}</div></section>
          <section className={styles.infoPanel}><h2>THÔNG TIN {venue.kind === "restaurant" ? "NHÀ HÀNG" : "KHÁCH SẠN"}</h2><dl><dt>Tên</dt><dd>{venue.title}</dd><dt>Địa chỉ</dt><dd>{venue.address}</dd><dt>Loại hình</dt><dd>{venue.kind === "hotel" ? "Resort 5 sao" : venue.kind === "restaurant" ? "Nhà hàng" : venue.kind}</dd>{isHotel && <><dt>Nhận phòng</dt><dd>{venue.checkIn || "14:00"}</dd><dt>Trả phòng</dt><dd>{venue.checkOut || "12:00"}</dd></>}</dl></section>
          <section className={styles.reviewPanel}><div className={styles.sectionTitle}><span></span><h2>ĐÁNH GIÁ KHÁCH HÀNG</h2></div><div className={styles.reviewScore}><strong>{venue.rating.toFixed(1)}</strong><div><span>★★★★★</span><small>{venue.reviewCount} đánh giá</small></div></div><blockquote>“{reviews[review].text}”</blockquote><div className={styles.reviewBy}><b>{reviews[review].name}</b><span>Đánh giá minh họa · Google Reviews chưa kết nối</span><div><button type="button" aria-label="Đánh giá trước" onClick={() => setReview((review + reviews.length - 1) % reviews.length)}>←</button><button type="button" aria-label="Đánh giá tiếp theo" onClick={() => setReview((review + 1) % reviews.length)}>→</button></div></div></section>
        </aside>
      </div>
      <section className={styles.detailBanner} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.8), rgba(3,23,43,.42)), url(" + PUBLIC_IMAGES[2] + ")" }}><div><span>NGHIENG TRAVEL</span><h2>TRẢI NGHIỆM VỊ NGON – LAN TỎA GIÁ TRỊ</h2><p>Cùng Nghiêng Travel khám phá hành trình ẩm thực và nghỉ dưỡng đẳng cấp.</p></div><Link className={styles.goldButton} href="/lien-he">Liên hệ & đặt dịch vụ <span aria-hidden="true">→</span></Link></section>
      <SiteFooter />
    </main>
  );
}
