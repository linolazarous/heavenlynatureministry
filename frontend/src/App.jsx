import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Layout from "@/components/Layout.jsx";
import Home from "@/pages/Home.jsx";
import About from "@/pages/About.jsx";
import Sermons from "@/pages/Sermons.jsx";
import Events from "@/pages/Events.jsx";
import Donations from "@/pages/Donations.jsx";
import DonationSuccess from "@/pages/DonationSuccess.jsx";
import ChildrensMinistry from "@/pages/ChildrensMinistry.jsx";
import Blog from "@/pages/Blog.jsx";
import LiveStream from "@/pages/LiveStream.jsx";
import PrayerRequests from "@/pages/PrayerRequests.jsx";
import Resources from "@/pages/Resources.jsx";
import Volunteer from "@/pages/Volunteer.jsx";

import "@/App.css";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<Layout />}>
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
