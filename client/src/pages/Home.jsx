import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaTicketAlt, FaShieldAlt, FaFilter, FaTimes } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        minPrice: '',
        maxPrice: '',
    });
    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasActiveFilters = Object.values(filters).some((value) => value.trim() !== '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchEvents();
        }, search.trim() || hasActiveFilters ? 350 : 0);

        return () => clearTimeout(timeout);
    }, [search, filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = {
                search: search.trim(),
                category: filters.category.trim(),
                location: filters.location.trim(),
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === '') {
                    delete params[key];
                }
            });

            const { data } = await api.get('/events', { params });
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    };

    const clearFilters = () => {
        setSearch('');
        setFilters({
            category: '',
            location: '',
            minPrice: '',
            maxPrice: '',
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-black text-white rounded-3xl overflow-visible mb-12 shadow-2xl">
                <div className="absolute inset-0 rounded-3xl opacity-40 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20">Welcome to Eventora</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Find Your Next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Unforgettable</span> Experience
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-7 top-1/2 z-10 -translate-y-1/2 text-gray-500 text-xl group-focus-within:text-black transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            className="w-full pl-16 pr-20 py-5 rounded-full text-lg text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-gray-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setFilterOpen((isOpen) => !isOpen)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-gray-900 hover:bg-gray-700 text-white flex items-center justify-center transition"
                            aria-label="Open filters"
                        >
                            {filterOpen ? <FaTimes /> : <FaFilter />}
                        </button>

                        {hasActiveFilters && (
                            <span className="absolute -top-1 right-3 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                                {Object.values(filters).filter((value) => value.trim() !== '').length}
                            </span>
                        )}

                        {filterOpen && (
                            <div className="absolute right-0 top-full z-30 mt-3 w-full max-w-xl rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-[130px_1fr]">
                                    <div className="bg-gray-100 p-4 text-left text-sm font-bold text-gray-700">
                                        <div className="py-3 border-b border-gray-200">Category</div>
                                        <div className="py-3 border-b border-gray-200">Location</div>
                                        <div className="py-3">Price</div>
                                    </div>
                                    <div className="p-4 space-y-3 text-left">
                                        <input
                                            type="text"
                                            name="category"
                                            placeholder="Category"
                                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-500"
                                            value={filters.category}
                                            onChange={handleFilterChange}
                                        />
                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Location"
                                            className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-500"
                                            value={filters.location}
                                            onChange={handleFilterChange}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                name="minPrice"
                                                min="0"
                                                placeholder="Min price"
                                                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-500"
                                                value={filters.minPrice}
                                                onChange={handleFilterChange}
                                            />
                                            <input
                                                type="number"
                                                name="maxPrice"
                                                min="0"
                                                placeholder="Max price"
                                                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-500"
                                                value={filters.maxPrice}
                                                onChange={handleFilterChange}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold transition"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Features row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaRegClock />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Booking</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Access</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Download tickets instantly or manage them right from your personal dashboard with easily.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Events</h2>
                <div className="text-gray-500 font-medium">{events.length} results found</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-gray-500">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col">
                            <div className="h-48 bg-gray-200 overflow-hidden relative">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
                                        {event.category || 'Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {event.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-gray-900">₹{event.ticketPrice}</span>}
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{event.category}</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">{event.name}</h2>
                                <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div className="bg-gray-700 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-16 pb-8 border-t border-gray-200 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <FaTicketAlt className="text-gray-800 text-2xl" />
                    <span className="text-xl font-bold text-gray-900">Eventora</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
