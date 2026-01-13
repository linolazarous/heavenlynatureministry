import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Sermons from "@/pages/Sermons";
import Events from "@/pages/Events";
import Donations from "@/pages/Donations";
import ChildrensMinistry from "@/pages/ChildrensMinistry";
import Blog from "@/pages/Blog";
import LiveStream from "@/pages/LiveStream";
import PrayerRequests from "@/pages/PrayerRequests";
import Resources from "@/pages/Resources";
import Volunteer from "@/pages/Volunteer";
import DonationSuccess from "@/pages/DonationSuccess";
import "@/App.css";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="sermons" element={<Sermons />} />
          <Route path="events" element={<Events />} />
          <Route path="donations" element={<Donations />} />
          <Route path="donation-success" element={<DonationSuccess />} />
          <Route path="childrens-ministry" element={<ChildrensMinistry />} />
          <Route path="blog" element={<Blog />} />
          <Route path="live" element={<LiveStream />} />
          <Route path="prayer" element={<PrayerRequests />} />
          <Route path="resources" element={<Resources />} />
          <Route path="volunteer" element={<Volunteer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;