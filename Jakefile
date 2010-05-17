PROJECT_DIR = File.expand_path(File.dirname(__FILE__))
TEST_DIR    = File.join(PROJECT_DIR, 'test')
IMAGES_DIR  = File.join(TEST_DIR, 'images')
ITEMS_JSON  = File.join(TEST_DIR, 'items.json')

require 'json'
require 'helium/jake'

# Create an images.json file from the list of image files in the test/images/
# directory. The file is then used by the test suite.
jake_hook :build_complete do |build|
  gallery = {
    :title => "Example gallery",
    :description => "<p>This is a sample description&hellip;</p>",
    :items => []
  }
  
  Dir.glob("#{IMAGES_DIR}/*.jpg") do |file|
    name = File.basename(file)
    
    gallery[:items] << {
      :name        => name.sub(/\.jpg/, ""),
      :description => "<p>Description of #{name}.</p>",
      :image => {
        :uri         => "images/#{name}",
        :width       => 360,
        :height      => 500
      },
      :thumbnail   => {
        :uri    => "images/thumbnails/#{name}",
        :width  => 144,
        :height => 200
      }
    }
    
    if name =~ /4\.jpg$/
      gallery[:items].last[:video] = {
        "video/m4a" => {
          :uri    => "video/test.m4a",
          :width  => 200,
          :height => 150
        }
      }
    end
  end
  
  gallery[:items][5][:description] = ""
  
  puts "Writing images listing to ./test/items.json"
  
  File.open(ITEMS_JSON, "w+") do |f|
    f.puts(gallery.to_json)
  end
end
