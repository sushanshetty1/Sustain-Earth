<div className="mt-4 space-y-2">
              <p className="text-gray-600 flex items-center gap-2">
                <People className="h-4 w-4" /> Age Group: {classData.standard}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date: {classData.classDate}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time: {classData.classTime}
              </p>
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Google Meet
              </a>
</div>