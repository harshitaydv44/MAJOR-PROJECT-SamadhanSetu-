import React, { useState, useEffect } from 'react';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import { DELHI_DISTRICTS } from '../../utils/constants';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  IndianRupee,
  Cpu,
  Send,
  Award
} from 'lucide-react';

const ORGANIZATION_TYPES = [
  'Industry',
  'Startup',
  'MSME',
  'CSR Organization',
  'Research Laboratory',
  'Innovation Hub'
];

const IndustryProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [organizationType, setOrganizationType] = useState('Industry');
  const [industrySector, setIndustrySector] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('North West Delhi');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Capabilities
  const [maxGrantAmount, setMaxGrantAmount] = useState('');
  const [csrBudgetAllocated, setCsrBudgetAllocated] = useState('');
  const [availableMentorsCount, setAvailableMentorsCount] = useState('6');
  const [mentorshipGuidelines, setMentorshipGuidelines] = useState('');
  const [manufacturingCapacity, setManufacturingCapacity] = useState('');

  // Tags
  const [expertise, setExpertise] = useState([]);
  const [newExp, setNewExp] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [newTech, setNewTech] = useState('');
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await industryService.getProfile();
      const p = res.data?.industry || {};
      const u = res.data?.user || {};
      setProfile(p);
      setName(p.name || u.organization || u.name || '');
      setOrganizationType(p.organizationType || 'Industry');
      setIndustrySector(p.industrySector || '');
      setLocation(p.location || '');
      setDistrict(p.district || u.district || 'North West Delhi');
      setWebsite(p.website || '');
      setContactPerson(p.contactPerson || u.name || '');
      setContactEmail(p.contactEmail || u.email || '');
      setContactPhone(p.contactPhone || u.phone || '');
      setLogo(p.logo || u.profileImage || '');
      setMaxGrantAmount(p.fundingCapability?.maxGrantAmount || 2500000);
      setCsrBudgetAllocated(p.fundingCapability?.csrBudgetAllocated || 10000000);
      setAvailableMentorsCount(p.mentorshipCapability?.availableMentorsCount || 6);
      setMentorshipGuidelines(p.mentorshipCapability?.guidelines || '');
      setManufacturingCapacity(p.implementationCapability?.manufacturingCapacity || '');
      setExpertise(p.expertise || []);
      setTechnologies(p.technologies || []);
      setResources(p.resources || []);
    } catch (err) {
      setErrorMsg('Failed to load industry profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await industryService.uploadLogo(formData);
      const uploadedUrl = res.data?.logoUrl || res.data?.industry?.logo;
      if (uploadedUrl) {
        setLogo(uploadedUrl);
      }
      setSuccessMsg('Organization logo uploaded successfully to Cloudinary and profile updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddTag = (list, setList, val, setVal) => {
    if (!val.trim()) return;
    if (!list.includes(val.trim())) {
      setList([...list, val.trim()]);
    }
    setVal('');
  };

  const handleRemoveTag = (list, setList, idx) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        name,
        organizationType,
        industrySector,
        location,
        district,
        website,
        contactPerson,
        contactEmail,
        contactPhone,
        logo,
        expertise,
        technologies,
        resources,
        fundingCapability: {
          maxGrantAmount: Number(maxGrantAmount) || 0,
          csrBudgetAllocated: Number(csrBudgetAllocated) || 0,
          fundingTypes: ['CSR Grant', 'Prototyping Co-Sponsorship', 'Pilot Testing Sponsorship']
        },
        mentorshipCapability: {
          availableMentorsCount: Number(availableMentorsCount) || 0,
          domains: expertise,
          guidelines: mentorshipGuidelines
        },
        implementationCapability: {
          manufacturingCapacity,
          fieldTrialSites: ['North Delhi Distribution Circles', 'Ghazipur Substation'],
          pilotSupportLocations: ['Bawana Industrial Area', 'Narela Substation']
        }
      };

      await industryService.updateProfile(payload);
      setSuccessMsg('Corporate profile, contact credentials, and collaboration capabilities updated successfully in Delhi directory!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update corporate profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading corporate organization profile..." />;
  }

  return (
    <div className="space-y-6 font-serif max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">
          Corporate & Industry Innovation Profile
        </h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Maintain your organization credentials, official contact representatives, logo, CSR grant bandwidth, physical testbeds, and mentorship guidelines.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Core Corporate Identity & Logo */}
        <Card accent="navy" title="Core Organization Information & Logo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Logo Uploader */}
            <div className="sm:col-span-2 p-4 bg-gov-sand-50 rounded-xs border border-gov-border flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-xs border border-gov-border bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                {logo ? (
                  <img src={logo} alt="Organization Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-gov-maroon opacity-60" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="block font-bold text-gov-navy uppercase tracking-wider text-xs">
                  Organization Logo (Cloudinary Upload)
                </label>
                <p className="text-[11px] text-gov-text-muted">
                  Upload official company logo in PNG, JPG, or WEBP format. This will be visible on your collaboration proposals.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <label className="inline-flex items-center px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded-xs cursor-pointer hover:bg-gov-navy-dark transition-colors">
                    <span>{uploadingLogo ? 'Uploading to Cloudinary...' : 'Choose Logo Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logo && (
                    <span className="text-[11px] text-emerald-800 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Logo Configured
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Organization / Company Legal Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Organization Type *
              </label>
              <select
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
              >
                {ORGANIZATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Industry Domain / Sector *
              </label>
              <input
                type="text"
                required
                value={industrySector}
                onChange={(e) => setIndustrySector(e.target.value)}
                placeholder="e.g. Clean Energy, Smart Grids & Utilities"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Corporate Headquarters / Lab Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Netaji Subhash Place, Pitampura, Delhi"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Delhi Revenue District *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
              >
                {DELHI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Official Corporate Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.tatapower-ddl.com"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            {/* Official Contact Representative Fields */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Primary Contact Person / Nodal Executive *
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma, VP Innovation"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Official Contact Email *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. innovation@tatapower-ddl.com"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Official Contact Phone / Direct Desk
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>
          </div>
        </Card>

        {/* 2. Capabilities & Bandwidth */}
        <Card accent="gold" title="Collaboration & Sponsorship Capabilities">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Max Grant per Project (INR)
              </label>
              <input
                type="number"
                value={maxGrantAmount}
                onChange={(e) => setMaxGrantAmount(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Total Annual CSR Allocated (INR)
              </label>
              <input
                type="number"
                value={csrBudgetAllocated}
                onChange={(e) => setCsrBudgetAllocated(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Available Industry Mentors Count
              </label>
              <input
                type="number"
                value={availableMentorsCount}
                onChange={(e) => setAvailableMentorsCount(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Mentorship Guidelines & Review Cadence
              </label>
              <input
                type="text"
                value={mentorshipGuidelines}
                onChange={(e) => setMentorshipGuidelines(e.target.value)}
                placeholder="e.g. Monthly sprint architectural review and code audits"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Manufacturing & Assembly Capacity
              </label>
              <input
                type="text"
                value={manufacturingCapacity}
                onChange={(e) => setManufacturingCapacity(e.target.value)}
                placeholder="e.g. PCB rapid assembly & high-voltage testing"
                className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
              />
            </div>
          </div>
        </Card>

        {/* 3. Three-way Tag Managers: Expertise, Technologies, Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Expertise */}
          <Card accent="none" title="Domain Expertise">
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-1 min-h-[60px]">
                {expertise.map((exp, idx) => (
                  <span key={idx} className="bg-gov-sand-100 text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[11px] font-semibold flex items-center">
                    <span>{exp}</span>
                    <button type="button" onClick={() => handleRemoveTag(expertise, setExpertise, idx)} className="ml-1 text-gray-400 hover:text-red-600">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1 pt-1 border-t border-gov-border">
                <input
                  type="text"
                  value={newExp}
                  onChange={(e) => setNewExp(e.target.value)}
                  placeholder="New domain..."
                  className="flex-1 font-serif border border-gov-border rounded-xs px-2 py-1 text-xs outline-none"
                />
                <Button variant="subtle" size="sm" type="button" onClick={() => handleAddTag(expertise, setExpertise, newExp, setNewExp)}>
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Technologies */}
          <Card accent="none" title="Technologies">
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-1 min-h-[60px]">
                {technologies.map((tech, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-xs text-[11px] font-semibold flex items-center">
                    <span>{tech}</span>
                    <button type="button" onClick={() => handleRemoveTag(technologies, setTechnologies, idx)} className="ml-1 text-indigo-400 hover:text-red-600">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1 pt-1 border-t border-gov-border">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="New technology..."
                  className="flex-1 font-serif border border-gov-border rounded-xs px-2 py-1 text-xs outline-none"
                />
                <Button variant="subtle" size="sm" type="button" onClick={() => handleAddTag(technologies, setTechnologies, newTech, setNewTech)}>
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Resources */}
          <Card accent="none" title="Physical Resources & Testbeds">
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-1 min-h-[60px]">
                {resources.map((res, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-xs text-[11px] font-semibold flex items-center">
                    <span>{res}</span>
                    <button type="button" onClick={() => handleRemoveTag(resources, setResources, idx)} className="ml-1 text-emerald-400 hover:text-red-600">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1 pt-1 border-t border-gov-border">
                <input
                  type="text"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  placeholder="New facility/testbed..."
                  className="flex-1 font-serif border border-gov-border rounded-xs px-2 py-1 text-xs outline-none"
                />
                <Button variant="subtle" size="sm" type="button" onClick={() => handleAddTag(resources, setResources, newResource, setNewResource)}>
                  Add
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gov-border">
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={saving}
            icon={Save}
            className="bg-gov-maroon hover:bg-gov-maroon-dark text-white px-6"
          >
            {saving ? 'Saving Corporate Profile...' : 'Save Corporate Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IndustryProfilePage;
