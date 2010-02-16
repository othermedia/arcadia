PROJECT_DIR = File.expand_path(File.dirname(__FILE__))
TEST_DIR    = File.join(PROJECT_DIR, 'test')
IMAGES_DIR  = File.join(TEST_DIR, 'images')
IMAGES_JSON = File.join(TEST_DIR, 'images.json')

require 'json'
require 'helium/jake'

# Create an images.json file from the list of image files in the test/images/
# directory. The file is then used by the test suite.
jake_hook :build_complete do |build|
  gallery = {
    :title => "Example gallery",
    :description => "<p>This is a sample description&hellip;</p>",
    :images => []
  }
  
  Dir.glob("#{IMAGES_DIR}/*.jpg") do |file|
    name = File.basename(file)
    
    gallery[:images] << {
      :name        => name.sub(/\.jpg/, ""),
      :uri         => "images/#{name}",
      :description => "<p>Description of #{name}.</p>",
      :width       => 360,
      :height      => 500
    }
  end
  
  puts "Writing images listing to ./test/images.json"
  
  File.open(IMAGES_JSON, "w+") do |f|
    f.puts(gallery.to_json)
  end
end
