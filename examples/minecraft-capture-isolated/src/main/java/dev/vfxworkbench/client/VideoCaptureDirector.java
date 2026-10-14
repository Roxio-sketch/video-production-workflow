package dev.vfxworkbench.client;

import com.google.gson.GsonBuilder;
import dev.vfxworkbench.core.*;
import dev.vfxworkbench.effects.blackhole.*;
import dev.vfxworkbench.effects.lightning.*;
import net.minecraft.client.*;
import net.minecraft.client.gui.screens.TitleScreen;
import net.minecraft.core.BlockPos;
import net.minecraft.world.Difficulty;
import net.minecraft.world.level.*;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.levelgen.WorldOptions;
import net.minecraft.world.level.levelgen.presets.WorldPresets;
import net.minecraft.world.phys.Vec3;
import net.minecraftforge.api.distmarker.Dist;
import net.minecraftforge.event.TickEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import org.lwjgl.BufferUtils;
import org.lwjgl.opengl.GL11;
import java.nio.*;
import java.nio.file.*;
import java.io.*;
import java.util.*;

/** Opt-in video director. Records the actual Minecraft framebuffer in a dedicated save.
 * All source modifications belong to the isolated video copy, not the published renderer. */
@Mod.EventBusSubscriber(modid=VfxWorkbenchMod.MODID,value=Dist.CLIENT)
public final class VideoCaptureDirector {
 private static final boolean ENABLED=Boolean.getBoolean("vfxworkbench.videoCapture");
 private static final Path OUT=Path.of(System.getProperty("vfxworkbench.videoOutput", "video-output"));
 private static final String SAVE=System.getProperty("vfxworkbench.videoSave", "Video-Workflow-Demo");
 private record Shot(String id,String kind,String preset,int seconds){}
 private static final Shot[] SHOTS={
  new Shot("bh-hero","bh","ribbons",8),new Shot("bh-granular","bh","granular",6),
  new Shot("bh-ribbons","bh","ribbons",6),
  new Shot("bh-classic","bh","classic",6),
  new Shot("bh-color-gold","bh","ribbons",6),new Shot("bh-color-ice","bh","ribbons",6),
  new Shot("bh-color-violet","bh","ribbons",6),new Shot("bh-shape","bh","ribbons",8),
  new Shot("bh-motion","bh","ribbons",8),new Shot("bh-particles","bh","classic",6),
  new Shot("bh-lens-off","bh","lens",5),new Shot("bh-lens-on","bh","lens",5),
  new Shot("bh-lens-small","bh","lens",6),new Shot("bh-lens-large","bh","lens",6),
  new Shot("bh-player-off","bh","lens",7),new Shot("bh-player-on","bh","lens",7),
  new Shot("bh-ui","bh","dust",9),new Shot("bh-finale","bh","ribbons",8),
  new Shot("lt-hero","lt","strike",7),new Shot("lt-seed-a","lt","strike",5),
  new Shot("lt-seed-b","lt","strike",5),new Shot("lt-branches-low","lt","strike",5),
  new Shot("lt-branches-high","lt","strike",5),new Shot("lt-gradient","lt","strike",9),
  new Shot("lt-ring","lt","ring",7),new Shot("lt-grow","lt","orbit",7),
  new Shot("lt-cluster","lt","cluster",8),new Shot("lt-rain","lt","rain",7),
  new Shot("lt-impact","lt","cluster",7),new Shot("lt-tribulation","lt","tribulation",8),
  new Shot("lt-ui","lt","strike",9),new Shot("lt-finale","lt","cluster",8),
  new Shot("bh-ui-shape","bh","ribbons",12),new Shot("bh-ui-color","bh","ribbons",10),
  new Shot("bh-ui-motion","bh","classic",12),new Shot("bh-ui-lens","bh","lens",8),
  new Shot("wh-hero","bh","white-ring",8),new Shot("wh-core","bh","white-ring",8),
  new Shot("wh-jets","bh","white-ring",8),new Shot("wh-shell","bh","white-ring",8),
  new Shot("wh-ui","bh","white-ring",12),
  new Shot("lt-ui-width","lt","strike",12),new Shot("lt-ui-gradient","lt","strike",12),
  new Shot("lt-ui-branch","lt","strike",12),new Shot("lt-ui-layout","lt","cluster",12),
  new Shot("lt-wuxing","lt","custom",10),new Shot("lt-wuxing-vivid","lt","custom",10),
  new Shot("bh-check-original","bh","ribbons",2),new Shot("bh-check-bend","bh","ribbons",2),
  new Shot("bh-check-radius","bh","ribbons",2),new Shot("bh-check-wide","bh","ribbons",2)
 };
 private static boolean opened,setup,done,recording;
 private static volatile boolean ready;
 private static int ticks,index=-1,frame,warmup,width,height;
 private static Vec3 eye;
 private static Process encoder;
 private static OutputStream pipe;
 private static ByteBuffer pixels;
 private static byte[] bytes;
 private static final java.util.List<Map<String,Object>> manifest=new ArrayList<>();
 @SubscribeEvent public static void tick(TickEvent.ClientTickEvent e){
  if(!ENABLED||done||e.phase!=TickEvent.Phase.END)return;
  var mc=Minecraft.getInstance();
  if(!opened&&(mc.screen instanceof TitleScreen||mc.screen instanceof net.minecraft.client.gui.screens.AccessibilityOnboardingScreen)&&mc.getOverlay()==null){
   opened=true;mc.options.pauseOnLostFocus=false;mc.options.renderDistance().set(5);
   try{if(Files.isRegularFile(OUT.resolve("capture-manifest.json"))){var type=new com.google.gson.reflect.TypeToken<java.util.List<Map<String,Object>>>(){}.getType();java.util.List<Map<String,Object>> previous=new com.google.gson.Gson().fromJson(Files.readString(OUT.resolve("capture-manifest.json")),type);manifest.addAll(previous);}}catch(Exception ignored){}
   mc.options.guiScale().set(2);mc.options.enableVsync().set(false);mc.options.framerateLimit().set(60);
   if(mc.getWindow().isFullscreen())mc.getWindow().toggleFullScreen();
   mc.options.onboardAccessibility=false;mc.getTutorial().setStep(net.minecraft.client.tutorial.TutorialSteps.NONE);
   mc.getWindow().setWindowed(1920,1080);
   if(Files.isRegularFile(mc.gameDirectory.toPath().resolve("saves").resolve(SAVE).resolve("level.dat")))mc.createWorldOpenFlows().loadLevel(mc.screen,SAVE);
   else mc.createWorldOpenFlows().createFreshLevel(SAVE,new LevelSettings("黑洞与闪电视频录制",GameType.CREATIVE,false,Difficulty.PEACEFUL,true,new GameRules(),WorldDataConfiguration.DEFAULT),new WorldOptions(20261011L,false,false),WorldPresets::createNormalWorldDimensions);
   System.out.println("[VIDEO] opening isolated save");return;
  }
  if(mc.level==null||mc.player==null||mc.getSingleplayerServer()==null)return;
  if(!setup){
   setup=true;mc.setScreen(null);mc.options.hideGui=true;mc.options.bobView().set(false);mc.options.cloudStatus().set(CloudStatus.OFF);mc.options.entityShadows().set(false);
   mc.getSingleplayerServer().execute(()->{
    var server=mc.getSingleplayerServer();var level=server.overworld();
    level.setDayTime(18000);level.setWeatherParameters(60000,0,false,false);
    level.getGameRules().getRule(GameRules.RULE_DAYLIGHT).set(false,server);
    level.getGameRules().getRule(GameRules.RULE_DOMOBSPAWNING).set(false,server);
    for(int x=-48;x<=48;x++)for(int z=-48;z<=48;z++){
     var block=(x%8==0||z%8==0)?Blocks.POLISHED_DEEPSLATE:Blocks.SMOOTH_STONE;
     level.setBlock(new BlockPos(x,199,z),block.defaultBlockState(),3);
    }
    for(int x=-32;x<=32;x++)for(int y=200;y<=244;y++)level.setBlock(new BlockPos(x,y,30),(x%8==0||y%8==0?Blocks.POLISHED_DEEPSLATE:Blocks.BLACK_CONCRETE).defaultBlockState(),3);
    for(int x:new int[]{-20,-12,12,20})for(int y=200;y<=218;y++)level.setBlock(new BlockPos(x,y,18),(y%6==0?Blocks.SEA_LANTERN:Blocks.QUARTZ_PILLAR).defaultBlockState(),3);
    for(var p:server.getPlayerList().getPlayers()){p.setGameMode(GameType.SPECTATOR);p.setNoGravity(true);p.teleportTo(level,0,209,-32,0,8);}
    ready=true;
   });
  }
  if(ready)ticks++;
  if(eye!=null){Vec3 pos=eye.add(0,-mc.player.getEyeHeight(),0);mc.player.setPos(pos);mc.player.setDeltaMovement(Vec3.ZERO);mc.player.setNoGravity(true);}
 }
 @SubscribeEvent public static void render(TickEvent.RenderTickEvent e){
  if(!ENABLED||done||!ready||ticks<180)return;
  var mc=Minecraft.getInstance();if(mc.level==null||mc.player==null)return;
  try{
   if(e.phase==TickEvent.Phase.START){
    if(index<0)next(mc);
    if(done)return;
    animate(mc);
    return;
   }
   if(warmup++<35)return;
   if(!recording)begin(mc);
   var target=mc.getMainRenderTarget();
   if(target.width!=width||target.height!=height)throw new IllegalStateException("Framebuffer resized during shot");
   target.bindWrite(false);pixels.clear();GL11.glPixelStorei(GL11.GL_PACK_ALIGNMENT,1);
   GL11.glReadPixels(0,0,width,height,GL11.GL_RGBA,GL11.GL_UNSIGNED_BYTE,pixels);
   pixels.position(0);pixels.get(bytes);pipe.write(bytes);
   if(frame==8||frame==SHOTS[index].seconds()*15){var still=Screenshot.takeScreenshot(target);still.writeToFile(OUT.resolve(SHOTS[index].id()+(frame==8?"":"-mid")+".png"));still.close();}
   frame++;
   if(frame>=SHOTS[index].seconds()*30){
    pipe.close();int code=encoder.waitFor();if(code!=0)throw new IOException("Encoder exit "+code);
    var row=new LinkedHashMap<String,Object>();row.put("id",SHOTS[index].id());row.put("frames",frame);row.put("fps",30);row.put("width",width);row.put("height",height);row.put("source","actual Minecraft 1.20.1 Forge framebuffer");row.put("parameters",ParamRegistry.state(SHOTS[index].kind().equals("bh")?"black-hole":"lightning").snapshot());
    manifest.removeIf(previous->SHOTS[index].id().equals(previous.get("id")));manifest.add(row);Files.writeString(OUT.resolve("capture-manifest.json"),new GsonBuilder().setPrettyPrinting().create().toJson(manifest));
    String json=SHOTS[index].kind().equals("bh")?BlackHoleSkillSchema.exportRecipe(ParamRegistry.state("black-hole")):LightningSkillSchema.exportRecipe();Files.writeString(OUT.resolve(SHOTS[index].id()+"-recipe.json"),json);
    System.out.println("[VIDEO] COMPLETE "+SHOTS[index].id()+" frames="+frame);
    recording=false;next(mc);
   }
  }catch(Exception ex){done=true;System.err.println("[VIDEO] FAILED "+ex);ex.printStackTrace();if(encoder!=null)encoder.destroy();mc.stop();}
 }
 private static void begin(Minecraft mc)throws Exception{
  Files.createDirectories(OUT);var target=mc.getMainRenderTarget();width=target.width;height=target.height;
  pixels=BufferUtils.createByteBuffer(width*height*4);bytes=new byte[width*height*4];
  var path=OUT.resolve(SHOTS[index].id()+".mp4");
  encoder=new ProcessBuilder(System.getProperty("vfxworkbench.videoFfmpeg", "ffmpeg"),"-hide_banner","-loglevel","error","-y","-f","rawvideo","-pixel_format","rgba","-video_size",width+"x"+height,"-framerate","30","-i","pipe:0","-vf","vflip","-an","-c:v","libx264","-preset","veryfast","-crf","17","-pix_fmt","yuv420p","-movflags","+faststart",path.toString()).redirectError(OUT.resolve(SHOTS[index].id()+"-encoder.log").toFile()).start();
  pipe=new BufferedOutputStream(encoder.getOutputStream(),1024*1024);recording=true;
 }
 private static void next(Minecraft mc)throws Exception{
  index++;String selection=System.getProperty("vfxworkbench.videoShots","");
  while(index<SHOTS.length&&!selection.isBlank()&&!java.util.Arrays.asList(selection.split(",")).contains(SHOTS[index].id()))index++;
  if(index>=SHOTS.length){done=true;mc.setScreen(null);BlackHoleClient.stop();LightningClient.stop();System.out.println("[VIDEO] ALL COMPLETE "+manifest.size());mc.stop();return;}
  frame=0;warmup=0;mc.setScreen(null);BlackHoleClient.stop();LightningClient.stop();
  var shot=SHOTS[index];System.out.println("[VIDEO] START "+shot.id());
  boolean playerShot=shot.id().startsWith("bh-player-");
  mc.options.setCameraType(playerShot?CameraType.THIRD_PERSON_BACK:CameraType.FIRST_PERSON);
  mc.player.setItemSlot(net.minecraft.world.entity.EquipmentSlot.HEAD,playerShot?new net.minecraft.world.item.ItemStack(net.minecraft.world.item.Items.GOLDEN_HELMET):net.minecraft.world.item.ItemStack.EMPTY);
  if(shot.kind().equals("bh")){
   var s=ParamRegistry.state("black-hole");s.resetToDefaults();s.set("form",shot.preset());BlackHoleSkillSchema.applyForm(s,shot.preset());
   s.set("scale",shot.id().startsWith("wh")?"1.8":"1.6");s.set("steps","256");s.set("tilt","-12");s.set("playing","false");s.set("time","40");
   eye=shot.id().startsWith("wh")?new Vec3(0,211,shot.id().contains("ui")?-30:-24):new Vec3(0,211,shot.id().contains("ui")?-32:-22);look(mc,new Vec3(shot.id().contains("ui")?-13:0,207,0));BlackHoleVideoBridge.place(new Vec3(0,207,0));
   if(!shot.id().startsWith("wh")&&!shot.id().contains("color")){s.set("hot","#FFF1CD");s.set("cool","#C64BFF");s.set("diskMid","#FFAC55");}
   if(shot.id().contains("color")){s.set("hot",shot.id().endsWith("gold")?"#FFE4A0":shot.id().endsWith("ice")?"#C2FFFF":"#F4B7FF");s.set("cool",shot.id().endsWith("gold")?"#F46B0A":shot.id().endsWith("ice")?"#0674F4":"#6816F5");s.set("diskMid",shot.id().endsWith("gold")?"#FFAF22":shot.id().endsWith("ice")?"#4CB2FF":"#BE4BEC");}
   // Art-directed recipe variations use supported controls; retain the dark core.
   if(shot.preset().equals("granular")){
    s.set("exposure",".55");s.set("density","4.8");s.set("thickness",".055");
    s.set("hot","#FFF0BE");s.set("diskMid","#E49CFF");s.set("cool","#643DDE");
    s.set("halo",".05");s.set("haloAura",".12");s.set("haloDisk",".1");
    s.set("diskBloom",".12");s.set("diskBloomRadius",".5");s.set("speed",".35");
   }
   if(shot.preset().equals("ribbons")){
    s.set("exposure",".68");s.set("density","4.5");s.set("diskBloom",".25");
    s.set("diskGradientPosition",".28");s.set("bandDetail","14");s.set("filament",".65");
    s.set("speed",".3");s.set("infallSpeed",".08");s.set("tilt","0");
    // Widen the physical disk relative to its lensed capture silhouette.
    s.set("outer","12");s.set("bend","1.6");s.set("beaming",".5");
    s.set("exposure",".52");s.set("density","3.8");
    if(shot.id().startsWith("bh-check-")){
     s.set("outer","8");s.set("bend","1.96");s.set("beaming","1");
     s.set("tilt","-6");s.set("exposure",".68");s.set("density","4.5");
    }
   }
   if(shot.preset().equals("classic")){
    s.set("hot","#D6FFFF");s.set("diskMid","#48B4F6");s.set("cool","#7035DA");
    s.set("exposure",".7");s.set("bandDetail","8");s.set("diskBloom",".25");s.set("tilt","-8");
   }
   if(shot.id().equals("bh-classic")){
    eye=new Vec3(0,209,-16);look(mc,new Vec3(0,207,0));
   }
   // Same camera, time and seed for the ribbon silhouette investigation.
   if(shot.id().equals("bh-check-bend"))s.set("bend","1.2");
   if(shot.id().equals("bh-check-radius"))s.set("outer","12");
   if(shot.id().equals("bh-check-wide")){s.set("outer","12");s.set("bend","1.2");s.set("beaming",".35");s.set("tilt","0");}
   if(shot.id().equals("bh-particles")){s.set("particles","true");s.set("particleCount","600");s.set("particleOuter","8");s.set("particleSize",".035");s.set("particleBrightness","2");}
   if(shot.id().equals("bh-lens-off"))s.set("lensStrength","0");
   if(shot.id().equals("bh-lens-on"))s.set("lensStrength","1");
   if(shot.id().equals("bh-lens-small")||shot.id().equals("bh-lens-large")){
    // Freeze the renderer so only lens reach changes between these shots.
    s.set("scale","1");s.set("core",".4");s.set("outer","3");s.set("density","0");
    s.set("halo","0");s.set("particles","false");s.set("lensStrength","1");
    s.set("lensRadius",shot.id().endsWith("small")?"3":"12");
    eye=new Vec3(0,208,-16);look(mc,new Vec3(0,207,0));
   }
   if(playerShot){
    s.set("scale","1");s.set("core",".3");s.set("inner","1.1");s.set("outer","3");
    s.set("density","0");s.set("halo","0");s.set("particles","false");s.set("bend","1.1");
    s.set("lensRadius","6");s.set("lensStrength","1");
    s.set("lensAffectsPlayer",Boolean.toString(shot.id().endsWith("on")));
    eye=new Vec3(0,201.62,0);look(mc,new Vec3(0,201.62,8));
    BlackHoleVideoBridge.place(new Vec3(1.3,201.05,1.4));
   }
   if(shot.id().startsWith("wh")){s.set("tilt","0");s.set("jetStrength","1.8");s.set("coreGlow","1.0");s.set("coreGlowRadius","1.6");s.set("particles","true");s.set("particleCount","480");}
   if(shot.id().equals("wh-core")){s.set("jetStrength","0");s.set("particles","false");}
   if(shot.id().equals("wh-jets")){s.set("jetStrength","2.2");s.set("jetLength","7");s.set("jetWidth",".24");}
   if(shot.id().equals("wh-shell")){s.set("shellEnabled","true");s.set("shellStrength","1.2");s.set("shellRadius","5");s.set("jetStrength",".3");}
   if(shot.id().contains("ui")){
    if(shot.id().equals("bh-ui-motion")){s.set("particles","true");s.set("particleCount","600");s.set("particleSize",".04");}
    if(shot.id().equals("wh-ui")){s.set("shellEnabled","true");s.set("shellStrength",".8");}
    mc.setScreen(new VfxWorkbenchScreen("black-hole"));
   }
  }else{
   var s=ParamRegistry.state("lightning");s.resetToDefaults();s.set("preset",shot.preset());
   // Compact video staging uses the published recipe, then changes supported parameters.
   s.set("triggerHeightMode","relativeGround");s.set("strikeHeight",shot.id().equals("lt-tribulation")?"70":"24");
   s.set("coreColor","#FFFFFF");s.set("glowColor","#FFFFFF");s.set("coreGain","3");s.set("glowGain","1.7");s.set("glowWidth",".16");s.set("strikeWidth",".045");
   s.set("gradientEnabled","true");s.set("gradientStart","#EB45FF");s.set("gradientEnd","#49EAFF");s.set("gradientCoreMode","vivid");
   if(shot.id().equals("lt-seed-a"))s.set("seed","18234");
   if(shot.id().equals("lt-seed-b"))s.set("seed","9417");
   if(shot.id().equals("lt-branches-low")){s.set("branchProbability","0");s.set("maxBranchDepth","0");}
   if(shot.id().equals("lt-branches-high")){s.set("branchProbability",".65");s.set("maxBranchDepth","2");s.set("branchLimit","40");}
   boolean orbit=shot.preset().equals("ring")||shot.preset().equals("orbit");
   eye=orbit?new Vec3(0,205,-16):shot.id().equals("lt-tribulation")?new Vec3(0,231,-88):new Vec3(0,211,-34);
   Vec3 focus=orbit?new Vec3(0,204,0):shot.id().equals("lt-tribulation")?new Vec3(0,230,0):new Vec3(0,212,0);
   if(shot.id().equals("lt-impact")){eye=new Vec3(8,205,-16);focus=new Vec3(0,201,0);s.set("strikeHeight","18");s.set("impactRadius","3");s.set("impactDuration","22");}
   look(mc,focus);LightningVideoBridge.start(new Vec3(0,orbit?204:200,0));
   if(shot.id().startsWith("lt-wuxing")){
    LightningSkillSchema.importRecipe(Files.readString(Path.of(System.getProperty("vfxworkbench.videoTribulationRecipe", "recipes/tribulation-08.json"))));
    s.set("triggerHeightMode","relativeGround");
    s.set("strikeWidth",".08");s.set("glowWidth","1.0");s.set("coreGain","8");s.set("glowGain","6");
    if(shot.id().endsWith("vivid")){s.set("gradientTarget","both");s.set("strikeWidth",".11");s.set("glowWidth","1.2");s.set("coreGain","12");s.set("gradientStart","#A85BFF");s.set("gradientEnd","#FFC35A");}
    eye=new Vec3(0,261,-112);look(mc,new Vec3(0,262,0));LightningVideoBridge.start(new Vec3(0,200,0));
   }
   if(shot.id().contains("ui")){s.set("flicker","0");look(mc,focus.add(-15,0,0));mc.setScreen(new VfxWorkbenchScreen("lightning"));}
  }
  Vec3 p=eye.add(0,-mc.player.getEyeHeight(),0);float yaw=mc.player.getYRot(),pitch=mc.player.getXRot();
  mc.getSingleplayerServer().execute(()->{for(var player:mc.getSingleplayerServer().getPlayerList().getPlayers()){
   player.setGameMode(playerShot?GameType.CREATIVE:GameType.SPECTATOR);
   player.getAbilities().flying=true;player.onUpdateAbilities();
   player.setItemSlot(net.minecraft.world.entity.EquipmentSlot.HEAD,playerShot?new net.minecraft.world.item.ItemStack(net.minecraft.world.item.Items.GOLDEN_HELMET):net.minecraft.world.item.ItemStack.EMPTY);
   player.teleportTo(mc.getSingleplayerServer().overworld(),p.x,p.y,p.z,yaw,pitch);
  }});
 }
 private static void look(Minecraft mc,Vec3 target){
  Vec3 direction=target.subtract(eye);float yaw=(float)Math.toDegrees(Math.atan2(-direction.x,direction.z)),pitch=(float)-Math.toDegrees(Math.atan2(direction.y,Math.hypot(direction.x,direction.z)));
  var p=eye.add(0,-mc.player.getEyeHeight(),0);mc.player.setPos(p);mc.player.xo=p.x;mc.player.yo=p.y;mc.player.zo=p.z;mc.player.setYRot(yaw);mc.player.yRotO=yaw;mc.player.setXRot(pitch);mc.player.xRotO=pitch;
 }
 private static void animate(Minecraft mc){
  var shot=SHOTS[index];double seconds=frame/30.0;
  if(shot.kind().equals("bh")){
   var s=ParamRegistry.state("black-hole");
   if(shot.id().equals("bh-shape")){s.set("tilt",Double.toString(-25+50.0*frame/(shot.seconds()*30)));s.set("thickness",Double.toString(.05+.22*frame/(shot.seconds()*30)));}
   if(shot.id().equals("bh-motion")){s.set("speed",frame<120?".2":"1.5");s.set("infallSpeed",frame<120?".1":"1.0");}
   if(shot.id().equals("wh-core")){s.set("coreGlow",Double.toString(.1+1.8*frame/(shot.seconds()*30)));s.set("coreGlowRadius",Double.toString(1.05+1.55*frame/(shot.seconds()*30)));}
   if(shot.id().equals("wh-jets"))s.set("jetStrength",Double.toString(.3+2.8*frame/(shot.seconds()*30)));
   if(shot.id().contains("ui")&&mc.screen instanceof VfxWorkbenchScreen ui){
    String[] keys;double[] lo,hi;
    if(shot.id().equals("bh-ui-shape")){keys=new String[]{"core","thickness","tilt"};lo=new double[]{.3,.05,-25};hi=new double[]{.95,.3,25};}
    else if(shot.id().equals("bh-ui-motion")){keys=new String[]{"speed","infallSpeed","particleSpeed"};lo=new double[]{.1,.05,.2};hi=new double[]{2,1.2,2.5};}
    else if(shot.id().equals("bh-ui-lens")){keys=new String[]{"lensStrength","lensRadius"};lo=new double[]{0,2};hi=new double[]{1,8};}
    else if(shot.id().equals("wh-ui")){keys=new String[]{"coreGlow","jetStrength","shellStrength"};lo=new double[]{.2,.1,.1};hi=new double[]{1.6,2.5,1.5};}
    else {keys=new String[]{"core"};lo=new double[]{.3};hi=new double[]{.95};}
    if(!shot.id().equals("bh-ui-color")){int part=Math.min(keys.length-1,frame/(shot.seconds()*30/keys.length));double t=(frame%(shot.seconds()*30/keys.length))/(double)(shot.seconds()*30/keys.length-1);ui.captureSlide(keys[part],lo[part]+(hi[part]-lo[part])*t);}
   }
   if(shot.id().equals("bh-ui-color")){
    int segment=frame/150;String key=segment==0?"hot":"cool";
    if(frame==0||frame==150){if(mc.screen instanceof ColorPickerScreen picker)picker.onClose();mc.setScreen(new ColorPickerScreen(s.schema.get(key),s));}
    if(mc.screen instanceof ColorPickerScreen picker){double t=(frame%150)/149.0;int r=(int)(255*(1-t)+60*t),g=(int)(120*(1-t)+190*t),b=(int)(30*(1-t)+255*t);picker.captureHex(String.format("#%02X%02X%02X",r,g,b));}
   }
   BlackHoleVideoBridge.time(shot.id().startsWith("bh-player-")||shot.id().equals("bh-lens-small")||shot.id().equals("bh-lens-large")?40:40+seconds);
  }else{
   var s=ParamRegistry.state("lightning");
   if(shot.id().equals("lt-gradient"))s.set("gradientRatio",Integer.toString((int)(100.0*frame/(shot.seconds()*30-1))));
   if(shot.id().contains("ui")&&mc.screen instanceof VfxWorkbenchScreen ui){
    String[] keys;double[] lo,hi;
    if(shot.id().equals("lt-ui-width")){keys=new String[]{"strikeWidth","glowWidth","coreGain"};lo=new double[]{.01,.08,1};hi=new double[]{.09,.45,5};}
    else if(shot.id().equals("lt-ui-gradient")){keys=new String[]{"gradientRatio","glowGain"};lo=new double[]{0,.3};hi=new double[]{100,3};}
    else if(shot.id().equals("lt-ui-branch")){keys=new String[]{"branchProbability","maxBranchDepth","branchLimit"};lo=new double[]{.05,0,4};hi=new double[]{.65,2,40};}
    else if(shot.id().equals("lt-ui-layout")){keys=new String[]{"rainCount","rainSpread","impactRadius"};lo=new double[]{3,2,1};hi=new double[]{12,10,4};}
    else {keys=new String[]{"gradientRatio"};lo=new double[]{0};hi=new double[]{100};}
    int part=Math.min(keys.length-1,frame/(shot.seconds()*30/keys.length));double t=(frame%(shot.seconds()*30/keys.length))/(double)(shot.seconds()*30/keys.length-1);ui.captureSlide(keys[part],lo[part]+(hi[part]-lo[part])*t);
   }
   // Parameter demonstrations hold a real event at a visible point in its
   // envelope, so a disappearing strike does not hide the parameter change.
   double cycle=seconds%1.7;LightningVideoBridge.time(shot.id().contains("ui")?4:shot.preset().equals("orbit")||shot.preset().equals("ring")?seconds*20:cycle*20);
   if(frame>0&&frame%51==0&&!shot.preset().equals("orbit")&&!shot.preset().equals("ring"))LightningVideoBridge.start(new Vec3(0,200,0));
  }
 }
}

