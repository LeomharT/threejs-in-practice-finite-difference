uniform vec3 uSunDirection;

varying vec3 vNormal;

void main(){
    vec3 color  = vec3(1.0);
    vec3 normal = normalize(vNormal);

    float lightColor = dot(normal, uSunDirection);
    lightColor = max(0.051, lightColor);

    color = vec3(lightColor);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
