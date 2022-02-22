<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis minScale="100000000" simplifyAlgorithm="0" styleCategories="AllStyleCategories" version="3.22.1-Białowieża" simplifyDrawingTol="5" labelsEnabled="0" symbologyReferenceScale="-1" hasScaleBasedVisibilityFlag="0" maxScale="0" simplifyMaxScale="1" simplifyLocal="0" readOnly="0" simplifyDrawingHints="0">
  <flags>
    <Identifiable>1</Identifiable>
    <Removable>1</Removable>
    <Searchable>1</Searchable>
    <Private>0</Private>
  </flags>
  <temporal endExpression="" durationField="" mode="0" limitMode="0" startField="" endField="" startExpression="" accumulate="0" fixedDuration="0" durationUnit="min" enabled="0">
    <fixedRange>
      <start></start>
      <end></end>
    </fixedRange>
  </temporal>
  <renderer-v2 symbollevels="0" referencescale="-1" type="singleSymbol" forceraster="0" enableorderby="0">
    <symbols>
      <symbol name="0" force_rhr="0" type="fill" alpha="1" clip_to_extent="1">
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties"/>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
        <layer class="SimpleFill" locked="0" pass="0" enabled="1">
          <Option type="Map">
            <Option name="border_width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"/>
            <Option name="color" type="QString" value="0,0,0,255"/>
            <Option name="joinstyle" type="QString" value="bevel"/>
            <Option name="offset" type="QString" value="0,0"/>
            <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"/>
            <Option name="offset_unit" type="QString" value="MM"/>
            <Option name="outline_color" type="QString" value="110,110,110,0"/>
            <Option name="outline_style" type="QString" value="solid"/>
            <Option name="outline_width" type="QString" value="0.4"/>
            <Option name="outline_width_unit" type="QString" value="Point"/>
            <Option name="style" type="QString" value="solid"/>
          </Option>
          <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
          <prop v="0,0,0,255" k="color"/>
          <prop v="bevel" k="joinstyle"/>
          <prop v="0,0" k="offset"/>
          <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
          <prop v="MM" k="offset_unit"/>
          <prop v="110,110,110,0" k="outline_color"/>
          <prop v="solid" k="outline_style"/>
          <prop v="0.4" k="outline_width"/>
          <prop v="Point" k="outline_width_unit"/>
          <prop v="solid" k="style"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" type="QString" value=""/>
              <Option name="properties"/>
              <Option name="type" type="QString" value="collection"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
    </symbols>
    <rotation/>
    <sizescale/>
  </renderer-v2>
  <customproperties>
    <Option type="Map">
      <Option name="OnConvertFormatRegeneratePrimaryKey" type="bool" value="true"/>
    </Option>
  </customproperties>
  <blendMode>0</blendMode>
  <featureBlendMode>0</featureBlendMode>
  <layerOpacity>1</layerOpacity>
  <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
    <activeChecks type="StringList">
      <Option type="QString" value=""/>
    </activeChecks>
    <checkConfiguration/>
  </geometryOptions>
  <legend showLabelLegend="0" type="default-vector"/>
  <referencedLayers/>
  <fieldConfiguration>
    <field name="OBJECTID" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="COMMUNE" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="OBJET" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="NIVEAU" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="SHAPE.AREA" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="SHAPE.LEN" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="SITG_ADM.C" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="layer" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="path" configurationFlags="None">
      <editWidget type="">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
  </fieldConfiguration>
  <aliases>
    <alias name="" field="OBJECTID" index="0"/>
    <alias name="" field="COMMUNE" index="1"/>
    <alias name="" field="OBJET" index="2"/>
    <alias name="" field="NIVEAU" index="3"/>
    <alias name="" field="SHAPE.AREA" index="4"/>
    <alias name="" field="SHAPE.LEN" index="5"/>
    <alias name="" field="SITG_ADM.C" index="6"/>
    <alias name="" field="layer" index="7"/>
    <alias name="" field="path" index="8"/>
  </aliases>
  <defaults>
    <default expression="" field="OBJECTID" applyOnUpdate="0"/>
    <default expression="" field="COMMUNE" applyOnUpdate="0"/>
    <default expression="" field="OBJET" applyOnUpdate="0"/>
    <default expression="" field="NIVEAU" applyOnUpdate="0"/>
    <default expression="" field="SHAPE.AREA" applyOnUpdate="0"/>
    <default expression="" field="SHAPE.LEN" applyOnUpdate="0"/>
    <default expression="" field="SITG_ADM.C" applyOnUpdate="0"/>
    <default expression="" field="layer" applyOnUpdate="0"/>
    <default expression="" field="path" applyOnUpdate="0"/>
  </defaults>
  <constraints>
    <constraint notnull_strength="0" field="OBJECTID" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="COMMUNE" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="OBJET" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="NIVEAU" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="SHAPE.AREA" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="SHAPE.LEN" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="SITG_ADM.C" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="layer" constraints="0" unique_strength="0" exp_strength="0"/>
    <constraint notnull_strength="0" field="path" constraints="0" unique_strength="0" exp_strength="0"/>
  </constraints>
  <constraintExpressions>
    <constraint field="OBJECTID" exp="" desc=""/>
    <constraint field="COMMUNE" exp="" desc=""/>
    <constraint field="OBJET" exp="" desc=""/>
    <constraint field="NIVEAU" exp="" desc=""/>
    <constraint field="SHAPE.AREA" exp="" desc=""/>
    <constraint field="SHAPE.LEN" exp="" desc=""/>
    <constraint field="SITG_ADM.C" exp="" desc=""/>
    <constraint field="layer" exp="" desc=""/>
    <constraint field="path" exp="" desc=""/>
  </constraintExpressions>
  <expressionfields/>
  <attributeactions>
    <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
  </attributeactions>
  <attributetableconfig actionWidgetStyle="dropDown" sortExpression="" sortOrder="0">
    <columns/>
  </attributetableconfig>
  <conditionalstyles>
    <rowstyles/>
    <fieldstyles/>
  </conditionalstyles>
  <storedexpressions/>
  <editform tolerant="1"></editform>
  <editforminit/>
  <editforminitcodesource>0</editforminitcodesource>
  <editforminitfilepath></editforminitfilepath>
  <editforminitcode><![CDATA[]]></editforminitcode>
  <featformsuppress>0</featformsuppress>
  <editorlayout>generatedlayout</editorlayout>
  <editable/>
  <labelOnTop/>
  <reuseLastValue/>
  <dataDefinedFieldProperties/>
  <widgets/>
  <previewExpression></previewExpression>
  <mapTip></mapTip>
  <layerGeometryType>2</layerGeometryType>
</qgis>
