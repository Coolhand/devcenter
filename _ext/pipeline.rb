Awestruct::Extensions::Pipeline.new do
  extension Awestruct::Extensions::Posts.new('/docs/Drupal', :drupal_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Wordpress', :wordpress_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Django', :django_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Go', :go_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Java', :java_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Jboss', :jboss_posts)
  extension Awestruct::Extensions::Posts.new('/docs/MongoDB', :mongo_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Mysql', :mysql_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Nodejs', :nodejs_posts)
  extension Awestruct::Extensions::Posts.new('/docs/PHP', :php_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Python', :python_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Ruby', :ruby_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Tomcat', :tomcat_posts)
  extension Awestruct::Extensions::Posts.new('/docs/Cartridge_Creation', :cartridge_posts)
  # extension Awestruct::Extensions::Indexifier.new
  # Indexifier *must* come before Atomizer
  # extension Awestruct::Extensions::Atomizer.new :posts, '/feed.atom'
  helper Awestruct::Extensions::Partial
end
