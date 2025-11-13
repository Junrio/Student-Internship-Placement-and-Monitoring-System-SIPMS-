"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InternshipFormData } from "@/lib/internship-module"

interface InternshipFormProps {
  onSubmit: (data: InternshipFormData) => void
  isLoading?: boolean
}

export function InternshipForm({ onSubmit, isLoading = false }: InternshipFormProps) {
  const [formData, setFormData] = useState<InternshipFormData>({
    position: "",
    department: "",
    company: "",
    supervisor: "",
    startDate: "",
    endDate: "",
    description: "",
    requirements: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Internship</CardTitle>
        <CardDescription>Add a new internship position</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position Title</Label>
              <Input
                id="position"
                name="position"
                placeholder="e.g., Software Developer"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                placeholder="e.g., Engineering"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor Name</Label>
              <Input
                id="supervisor"
                name="supervisor"
                placeholder="Supervisor name"
                value={formData.supervisor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Job description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-input rounded-md min-h-24 font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <textarea
              id="requirements"
              name="requirements"
              placeholder="List requirements (one per line)"
              value={formData.requirements}
              onChange={handleChange}
              className="w-full p-2 border border-input rounded-md min-h-20 font-sans"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Internship"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
