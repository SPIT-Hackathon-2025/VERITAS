"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Developer",
    company: "TechCorp",
    feedback: "MindLink IDE has transformed how our team collaborates. The real-time features are game-changing.",
    avatar: "/placeholder/avatar/3.jpg"
  },
  {
    name: "Alex Rodriguez",
    role: "Tech Lead",
    company: "InnoSoft",
    feedback: "The AI suggestions have significantly improved our code quality and development speed.",
    avatar: "/placeholder/avatar/2.jpg"
  },
  {
    name: "Emma Wilson",
    role: "Full Stack Developer",
    company: "DevFirst",
    feedback: "The intuitive interface and powerful features make this IDE stand out from the competition.",
    avatar: "placeholder/avatar/1.jpg"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const testimonialVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export const FeedbackSection = () => {
  return (
    <section id="feedback" className="py-24 ">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See what engineering teams are saying about their experience with MindLink IDE
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 place-items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              variants={testimonialVariants}
              className="w-full max-w-sm col-auto"
            >
              <Card className="h-full bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <blockquote className="flex-1">
                      <p className="text-gray-300 text-lg mb-6 italic">
                        "{testimonial.feedback}"
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">
                          {testimonial.role} • {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}